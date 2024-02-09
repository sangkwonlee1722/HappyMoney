import { Process, Processor } from "@nestjs/bull";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { EntityManager, Repository } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { Account } from "src/accounts/entities/account.entity";
import { AccountsService } from "src/accounts/accounts.service";
import { OrderService } from "./order.service";
import { StockHolding } from "./entities/stockHolding.entity";
import { BadRequestException } from "@nestjs/common";

// 'orders' 큐를 처리하는 프로세서
@Processor("orders")
export class orderProcessor {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly accountsService: AccountsService,
    private readonly orderService: OrderService,
    @InjectRepository(StockHolding)
    private readonly stockHoldingRepository: Repository<StockHolding>
  ) {}

  // 구매(매수)
  @Process("buy")
  async handleBuyOrder(job: Job) {
    const { buyOrder, id } = job.data;

    const account = await this.accountsService.findOneAccount(id);
    /* 주식 구매(매수) 시 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      try {
        // 구매(매수) 내역 저장
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
        const sH = await this.orderService.findOneStock(account.id, buyOrder.stockCode);

        // 계좌에 해당 주식이 없고 체결 됐을 때,
        if (!sH && buyOrder.status === OrderStatus.Complete) {
          const createSh = em.create(StockHolding, {
            userId: id,
            accountId: account.id,
            stockName: buyOrder.stockName,
            stockCode: buyOrder.stockCode,
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
    /* 주식 구매(매수) 시 트랜잭션 e */
  }

  // 판매(매도)
  @Process("sell")
  async handlesellOrder(job: Job) {
    const { sellOrder, id } = job.data;

    const account = await this.accountsService.findOneAccount(id);
    // 계좌에 해당 주식 확인
    const sH = await this.orderService.findOneStock(account.id, sellOrder.stockCode);
    if (!sH) throw new BadRequestException({ success: false, message: "주식을 보유하고 있지 않습니다" });
    if (sH.numbers < sellOrder.orderNumbers)
      throw new BadRequestException({ success: false, message: "보유한 주식보다 수량이 많습니다." });

    /* 주식 판매(매도) 시 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      try {
        // 판매(매도) 내역 저장
        await em.save(Order, sellOrder);

        // 예약 매도 수량 확인
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
    /* 주식 판매(매도) 시 트랜잭션 e */

    // 주식 보유수가 0일 때 보유 주식 데이터 삭제
    const updateStock = await this.orderService.findOneStock(account.id, sellOrder.stockCode);
    if (updateStock.numbers === 0) {
      await this.stockHoldingRepository.delete({ accountId: account.id, stockCode: sellOrder.stockCode });
    }
  }
}
