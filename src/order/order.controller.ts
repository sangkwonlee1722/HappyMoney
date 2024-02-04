import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@ApiBearerAuth()
@ApiTags("Orders")
@UseGuards(AuthGuard("jwt"))
@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  /**
   * 구매(매도)
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
   * 판매(매수)
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
}
