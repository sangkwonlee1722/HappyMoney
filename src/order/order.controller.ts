import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@ApiBearerAuth()
@ApiTags("Orders")
@UseGuards(AuthGuard("jwt"))
@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  /**
   * 구매(매수)
   * @param createTwitDto
   * @returns
   */
  @Post("buy")
  async buyStock(@UserInfo() user: User, @Body() createOrderDto: CreateOrderDto) {
    await this.orderService.buyStock(user, createOrderDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 판매(매도)
   * @param createTwitDto
   * @returns
   */
  @Post("sell")
  async sellStock(@UserInfo() user: User, @Body() createOrderDto: CreateOrderDto) {
    await this.orderService.sellStock(user, createOrderDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 총 주문내역
   * @returns
   */
  @Get("order")
  async getOrders(@UserInfo() user: User, @Query() query: PaginatePostDto) {
    const { orders, total } = await this.orderService.getOrders(user, query);

    return {
      success: true,
      message: "okay",
      orders,
      total
    };
  }
  /**
   * 해당 주식 주문내역
   * @returns
   */
  @Get("order/:stockCode")
  async stockOrders(@Param("stockCode") stockCode: string, @UserInfo() user: User, @Query() query: PaginatePostDto) {
    const data = await this.orderService.stockOrders(stockCode, user, query);

    return {
      success: true,
      message: "okay",
      data
    };
  }

  /**
   * 주문 대기 내역
   * @returns
   */
  @Get("wait")
  async getWatingOrders(@UserInfo() user: User) {
    const data = await this.orderService.getWatingOrders(user);

    return {
      success: true,
      message: "okay",
      data
    };
  }

  /**
   * 대기 구매(매수)주문 취소
   * @param id
   * @returns
   */
  @Patch("wait/buy/:id")
  async cancelBuyOrder(@Param("id") orderId: number, @UserInfo() user: User) {
    const data = await this.orderService.cancelBuyOrder(orderId, user);

    return {
      success: true,
      message: "okay",
      data
    };
  }

  /**
   * 대기 판매(매도)주문 취소
   * @param id
   * @returns
   */
  @Patch("wait/sell/:id")
  async cancelSellOrder(@Param("id") orderId: number, @UserInfo() user: User) {
    const data = await this.orderService.cancelSellOrder(orderId, user);

    return {
      success: true,
      message: "okay",
      data
    };
  }

  /**
   * 보유 주식
   * @returns
   */
  @Get("stock")
  async getStockHoldings(@UserInfo() user: User) {
    const data = await this.orderService.getStockHoldings(user);

    return {
      success: true,
      message: "okay",
      data
    };
  }

  /**
   * 특정 종목 보유 주식
   * @param stockCode
   * @param user
   * @returns
   */
  @Get("stock/:stockCode")
  async getStockHolding(@Param("stockCode") stockCode: string, @UserInfo() user: User) {
    const data = await this.orderService.getStockHolding(stockCode, user);

    return {
      success: true,
      message: "okay",
      data
    };
  }
}
