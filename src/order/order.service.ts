import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { StockHolding } from "./entities/stockHolding.entity";
import { EntityManager, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AccountsService } from "src/accounts/accounts.service";
import { Account } from "src/accounts/entities/account.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(StockHolding)
    private readonly stockHoldingRepository: Repository<StockHolding>,
    private readonly accountsService: AccountsService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  // 구매(매도)API
  async buyStock({ id }: User, { stockName, stockCode, orderNumbers, price, status }: CreateOrderDto) {
    const account = await this.accountsService.findOneAccount(id);

    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    // 매도 내역 생성
    const buyOrder = this.orderRepository.create({
      userId: id,
      accountId: account.id,
      stockName,
      stockCode,
      orderNumbers,
      price,
      ttlPrice: orderNumbers * price,
      buySell: true,
      status
    });

    /* 주식 구매(매도) 시 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      try {
        // 구매(매도) 내역 저장
        await em.save(Order, buyOrder);

        // 계좌 포인트
        await em.update(
          Account,
          { id: account.id },
          {
            point: account.point - buyOrder.ttlPrice
          }
        );

        // 계좌에 해당 주식 확인
        const sH = await this.findOneStock(account.id, buyOrder.stockCode);

        // 계좌에 해당 주식이 없고 체결 됐을 때,
        if (!sH && buyOrder.status === OrderStatus.Complete) {
          const createSh = em.create(StockHolding, {
            userId: id,
            accountId: account.id,
            stockName,
            stockCode,
            numbers: buyOrder.orderNumbers,
            ttlPrice: buyOrder.ttlPrice
          });

          await em.save(StockHolding, createSh);
        }

        // 계좌에 해당 주식이 있고 체결 됐을 때,
        if (sH && buyOrder.status === OrderStatus.Complete) {
          await em.update(
            StockHolding,
            { accountId: buyOrder.accountId, stockCode: buyOrder.stockCode },
            {
              numbers: sH.numbers + buyOrder.orderNumbers,
              ttlPrice: sH.ttlPrice + buyOrder.ttlPrice
            }
          );
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
    /* 주식 구매(매도) 시 트랜잭션 e */
  }

  // 판매(매수)API
  async sellStock({ id }: User, { stockName, stockCode, orderNumbers, price, status }: CreateOrderDto) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    // 판매(매수) 내역 생성
    const sellOrder = this.orderRepository.create({
      userId: id,
      accountId: account.id,
      stockName,
      stockCode,
      orderNumbers,
      price,
      ttlPrice: orderNumbers * price,
      buySell: false,
      status
    });

    // 계좌에 해당 주식 확인
    const sH = await this.findOneStock(account.id, sellOrder.stockCode);
    if (!sH) throw new BadRequestException({ success: false, message: "주식을 보유하고 있지 않습니다" });
    if (sH.numbers < sellOrder.orderNumbers)
      throw new BadRequestException({ success: false, message: "보유한 주식보다 수량이 많습니다." });

    /* 주식 판매(매수) 시 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      try {
        // 판매(매수) 내역 저장
        await em.save(Order, sellOrder);

        // 예약 매수 수량 확인
        const orderChk = await em.find(Order, {
          where: { accountId: account.id, buySell: false, stockCode: sH.stockCode, status: OrderStatus.Order }
        });
        const totalOrderNumbers = orderChk.reduce((total, order) => total + order.orderNumbers, 0);
        if (totalOrderNumbers > sH.numbers)
          throw new BadRequestException({ success: false, message: "보유 주식보다 예약 매수 수량이 많습니다." });

        // 체결 됐을 때,
        if (sH && sellOrder.status === OrderStatus.Complete) {
          // 계좌 포인트
          await em.update(
            Account,
            { id: account.id },
            {
              point: account.point + sellOrder.ttlPrice
            }
          );

          await em.update(
            StockHolding,
            { accountId: sellOrder.accountId, stockCode: sellOrder.stockCode },
            {
              numbers: sH.numbers - sellOrder.orderNumbers,
              ttlPrice: sH.ttlPrice - sellOrder.ttlPrice
            }
          );
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
    /* 주식 판매(매수) 시 트랜잭션 e */

    // 주식 보유수가 0일 때 보유 주식 데이터 삭제
    const updateStock = await this.findOneStock(account.id, sellOrder.stockCode);
    if (updateStock.numbers === 0) {
      await this.stockHoldingRepository.delete({ accountId: account.id, stockCode: sellOrder.stockCode });
    }
  }

  // 보유 주식 조회API
  // 해당 주식 조회API
  // 예약 매도체결API
  // 예약 매수체결API
  // 예약 매도 취소API
  // 예약 매수 취소API

  // 주식 확인
  async findOneStock(accountId: number, stockCode: string) {
    return await this.stockHoldingRepository.findOne({
      where: { accountId: accountId, stockCode: stockCode }
    });
  }
}
