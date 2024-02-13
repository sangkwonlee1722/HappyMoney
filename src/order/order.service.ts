import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { StockHolding } from "./entities/stockHolding.entity";
import { EntityManager, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AccountsService } from "src/accounts/accounts.service";
import { Account } from "src/accounts/entities/account.entity";
import { PaginatePostDto } from "src/common/dto/paginate.dto";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { StockService } from "src/stock/stock.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(StockHolding)
    private readonly stockHoldingRepository: Repository<StockHolding>,
    private readonly accountsService: AccountsService,
    private readonly stockService: StockService,
    private schedulerRegistry: SchedulerRegistry,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectQueue("orders") private ordersQueue: Queue
  ) {}
  // 작업을 수행할지 여부
  private shouldRunTask: boolean = false;

  // 평일 9시부터 시작
  @Cron("0 10 0 * * 1-5")
  startTask() {
    this.shouldRunTask = true;
    const timeout = setTimeout(() => this.waitOrderChk(), 0); // 즉시 실행
    this.schedulerRegistry.addTimeout("waitOrderChk", timeout);
  }

  // 평일 15시 25분에 종료
  @Cron("0 25 15 * * 1-5")
  stopTask() {
    this.shouldRunTask = false;
    // 기존에 등록된 작업을 중지
    const timeout = this.schedulerRegistry.getTimeout("waitOrderChk");
    clearTimeout(timeout);
  }

  async onModuleInit() {
    // 서버가 켜질때 시작
    this.waitOrderChk();
  }

  // 대기 주문 체결
  async waitOrderChk() {
    if (!this.shouldRunTask) {
      return;
    }
    try {
      const orders = await this.orderRepository.find({ where: { status: OrderStatus.Order } });
      console.log("orders", orders);
      // 몇초마다 수행할지 비동기를 동기적으로 사용하기 위해 Promise작업
      const delay = (interval) => new Promise((resolve) => setTimeout(resolve, interval));

      await this.entityManager.transaction(async (em) => {
        let count = 0;
        for (const order of orders) {
          // 해당주문이 앞에서 완료 됐을 때 바로 넘어감
          if (order.status !== OrderStatus.Order) return;
          // 가격비교를 위한 현재가 호가OpenAPI
          const list = await this.stockService.getStockPrice(order.stockCode);
          const stockPr = list.output1.bidp1;
          // 구매(매수)일 때,
          const buyOrderCode = await em.find(Order, {
            where: { stockCode: order.stockCode, status: OrderStatus.Order, buySell: true }
          });
          console.log("buy", buyOrderCode);

          for (const buyOrder of buyOrderCode) {
            // 계좌에 해당 주식 확인
            const sH = await this.findOneStock(buyOrder.accountId, order.stockCode);
            if (buyOrder.price >= stockPr) {
              buyOrder.status = OrderStatus.Complete;
              await em.save(buyOrder);
            }
            // 계좌에 해당 주식이 없고 체결 됐을 때,
            if (!sH && buyOrder.status === OrderStatus.Complete) {
              const createSh = em.create(StockHolding, {
                userId: buyOrder.userId,
                accountId: buyOrder.accountId,
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
          }

          // 판매(매도)일 때,
          const sellOrderCode = await em.find(Order, {
            where: { stockCode: order.stockCode, status: OrderStatus.Order, buySell: false }
          });
          console.log("sell", sellOrderCode);

          for (const sellOrder of sellOrderCode) {
            // 계좌에 해당 주식 확인
            const sH = await this.findOneStock(sellOrder.accountId, order.stockCode);
            const sellAccount = await em.findOne(Account, { where: { userId: sellOrder.userId } });
            if (sellOrder.price <= stockPr) {
              sellOrder.status = OrderStatus.Complete;
              await em.save(sellOrder);

              sellAccount.point += sellOrder.ttlPrice;
              await em.save(sellAccount);

              await em.update(
                StockHolding,
                { accountId: sellOrder.accountId, stockCode: sellOrder.stockCode },
                {
                  numbers: sH.numbers - sellOrder.orderNumbers,
                  ttlPrice: sH.ttlPrice - sellOrder.ttlPrice
                }
              );
            }
          }

          // 10개를 출력할 때마다 1초뒤에 다시 실행
          count++;
          if (count % 10 === 0) {
            await delay(1000);
          }
        }
      });
    } catch (error) {
      console.error("orderChk error", error);
      throw error;
    } finally {
      if (this.shouldRunTask) {
        // 기존에 등록된 작업이 있다면 제거
        const existingTimeout = this.schedulerRegistry.getTimeout("waitOrderChk");
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          this.schedulerRegistry.deleteTimeout("waitOrderChk");
        }
        // waitOrderChk 작업을 1초 후에 다시 실행
        const timeout = setTimeout(() => this.waitOrderChk(), 1000);
        this.schedulerRegistry.addTimeout("waitOrderChk", timeout);
      }
    }
  }

  // 주문 대기 삭제
  // 월~금 오후 3시 30분 대기중인 주문 건 취소
  @Cron("0 30 15 * * 1-5")
  async cleanupOrders() {
    try {
      const orders = await this.orderRepository.find({ where: { status: OrderStatus.Order } });

      /* 대기 주문 취소 트랜잭션 s */
      await this.entityManager.transaction(async (em) => {
        for (const order of orders) {
          // 구매(매수)건일 때,
          const updateAccount = await em.findOne(Account, { where: { userId: order.userId } });
          if (order.buySell && order.status === OrderStatus.Order) {
            // console.log("point", updateAccount.point);
            // console.log("plusPoint", order.ttlPrice);
            // console.log("해당 계좌", updateAccount);
            // console.log("주문내역", order);
            updateAccount.point += order.ttlPrice;
            await em.save(updateAccount);
          }
          // 주문 상태 업데이트
          await em.update(Order, { id: order.id }, { status: OrderStatus.Cancel });
        }
      });
      /* 대기 주문 취소 트랜잭션 e */

      console.log("주문 대기 건 취소 완료");
      return {
        success: true,
        message: "체결되지 않은 주문 건이 삭제되었습니다."
      };
    } catch (error) {
      console.error("Error during cleanup:", error);
      return {
        success: false,
        message: "주문 대기 건 취소 중 오류가 발생했습니다."
      };
    }
  }

  // 구매(매수)API
  async buyStock({ id }: User, { stockName, stockCode, orderNumbers, price, status }: CreateOrderDto) {
    const account = await this.accountsService.findOneAccount(id);

    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    // 매수 내역 생성
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

    try {
      // 주문 데이터를 Redis 큐에 추가
      await this.ordersQueue.add(
        "buy",
        { buyOrder, id },
        {
          priority: 1, // 우선순위 설정
          attempts: 3, // 주문 처리가 실패했을 때 최대 3번까지 재시도
          backoff: 1000, // 재시도 간의 지연 시간
          removeOnComplete: true, // 주문이 성공적으로 처리되면 큐에서 제거
          jobId: `${buyOrder.userId}-${buyOrder.stockCode}-${buyOrder.buySell}-${Date.now()}` // 주문 ID를 설정
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 판매(매도)API
  async sellStock({ id }: User, { stockName, stockCode, orderNumbers, price, status }: CreateOrderDto) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });
    // 판매(매도) 내역 생성
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

    // 예약 매도 수량 확인
    const orderChk = await this.orderRepository.find({
      where: { accountId: account.id, buySell: false, stockCode: sH.stockCode, status: OrderStatus.Order }
    });
    const totalOrderNumbers = orderChk.reduce((total, order) => total + order.orderNumbers, 0);
    if (totalOrderNumbers > sH.numbers)
      throw new BadRequestException({ success: false, message: "보유 주식보다 예약 매수 수량이 많습니다." });

    try {
      await this.ordersQueue.add(
        "sell",
        { sellOrder, id },
        {
          priority: 1,
          attempts: 3,
          backoff: 1000,
          removeOnComplete: true,
          jobId: `${sellOrder.userId}-${sellOrder.stockCode}-${sellOrder.buySell}-${Date.now()}`
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 총 주문 내역API
  async getOrders({ id }: User, dto: PaginatePostDto) {
    const account = await this.accountsService.findOneAccount(id);

    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId: id, accountId: account.id },
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });

    return {
      orders,
      total
    };
  }

  // 해당 주식 주문내역API
  async stockOrders(stockCode: string, { id }: User, dto: PaginatePostDto) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId: id, accountId: account.id, stockCode },
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });

    return {
      orders,
      total
    };
  }

  // 주문 대기내역API
  async getWatingOrders({ id }: User) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    const waitingLists = await this.orderRepository.find({
      where: { userId: id, accountId: account.id, status: OrderStatus.Order }
    });

    return waitingLists;
  }

  // 구매(매수) 대기내역 취소API
  async cancelBuyOrder(orderId: number, { id }: User) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: id, accountId: account.id, status: OrderStatus.Order, buySell: true }
    });
    if (!order) throw new BadRequestException({ success: false, message: "주문을 찾을 수 없습니다." });

    await this.entityManager.transaction(async (em) => {
      try {
        order.status = OrderStatus.Cancel;
        await em.save(Order, order);

        // 계좌 포인트
        await em.update(
          Account,
          { id: account.id },
          {
            point: account.point + order.ttlPrice
          }
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    });

    return order;
  }

  // 판매(매도) 대기내역 취소API
  async cancelSellOrder(orderId: number, { id }: User) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: id, accountId: account.id, status: OrderStatus.Order, buySell: false }
    });
    if (!order) throw new BadRequestException({ success: false, message: "주문을 찾을 수 없습니다." });

    order.status = OrderStatus.Cancel;
    await this.orderRepository.save(order);

    return order;
  }

  // 보유 주식 조회API
  async getStockHoldings({ id }: User) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    // const data = await this.stockHoldingRepository.find({ where: { userId: id, accountId: account.id } });

    const data = await this.stockHoldingRepository
      .createQueryBuilder("sh")
      .leftJoinAndSelect("sh.stock", "s")
      .select([
        "sh.id AS id",
        "sh.stockName AS stockName",
        "sh.userId AS userId",
        "sh.stockCode AS stockCode",
        "sh.numbers AS numbers",
        "s.clpr as clpr"
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(o.order_numbers)", "totalBuyOrderNumbers")
          .from("orders", "o")
          .where("o.accountId =:accountId", { accountId: account.id })
          .andWhere("o.buySell=1")
          .andWhere("o.status='complete'")
          .andWhere("o.stockCode=sh.stockCode");
      }, "totalCompleteBuyOrderNumbers")
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(o.ttl_price)", "totalBuyOrderPrice")
          .from("orders", "o")
          .where("o.accountId =:accountId", { accountId: account.id })
          .andWhere("o.buySell=1")
          .andWhere("o.status='complete'")
          .andWhere("o.stockCode=sh.stockCode");
      }, "totalCompleteBuyOrderPrice")
      .where("sh.userId=:userId", { userId: id })
      .getRawMany();

    return data;
  }

  // 해당 주식 조회API
  async getStockHolding(stockCode: string, { id }: User) {
    const account = await this.accountsService.findOneAccount(id);
    if (!account) throw new BadRequestException({ success: false, message: "계좌를 생성해주세요." });

    // const data = await this.stockHoldingRepository.findOne({
    //   where: { id: stockHoldingId, userId: id, accountId: account.id }
    // });
    // if (!data) throw new NotFoundException({ success: false, message: "해당 주식을 찾을 수 없습니다." });

    const data = await this.stockHoldingRepository
      .createQueryBuilder("sh")
      .leftJoinAndSelect("sh.stock", "s")
      .select([
        "sh.id AS id",
        "sh.stockName AS stockName",
        "sh.userId AS userId",
        "sh.stockCode AS stockCode",
        "sh.numbers AS numbers",
        "s.clpr as clpr"
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(o.order_numbers)", "totalBuyOrderNumbers")
          .from("orders", "o")
          .where("o.accountId =:accountId", { accountId: account.id })
          .andWhere("o.buySell=1")
          .andWhere("o.status='complete'")
          .andWhere("o.stockCode=sh.stockCode");
      }, "totalCompleteBuyOrderNumbers")
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(o.ttl_price)", "totalBuyOrderPrice")
          .from("orders", "o")
          .where("o.accountId =:accountId", { accountId: account.id })
          .andWhere("o.buySell=1")
          .andWhere("o.status='complete'")
          .andWhere("o.stockCode=sh.stockCode");
      }, "totalCompleteBuyOrderPrice")
      .where("sh.userId=:userId", { userId: id })
      .andWhere("sh.stockCode=:stockCode", { stockCode })
      .getRawOne();

    return data;
  }

  // 주식 확인
  async findOneStock(accountId: number, stockCode: string) {
    return await this.stockHoldingRepository.findOne({
      where: { accountId: accountId, stockCode: stockCode }
    });
  }
}
