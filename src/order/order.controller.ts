import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";

@ApiBearerAuth()
@ApiTags("Orders")
@UseGuards(AuthGuard("jwt"))
@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //   /**
  //  * 구매(매도)
  //  * @param createTwitDto
  //  * @returns
  //  */
  //   @Post()
  //   async stockBuy(@UserInfo() user: User, @Body() createTwitDto) {
  //     await this.orderService.sendTwit(user, createTwitDto);
  //     return {
  //       success: true,
  //       message: "okay"
  //     };
  // }

  //   /**
  //  * 판매(매수)
  //  * @param createTwitDto
  //  * @returns
  //  */
  //   @Post()
  //   async stockSell(@UserInfo() user: User, @Body() createTwitDto) {
  //     await this.orderService.(user, createTwitDto);
  //     return {
  //       success: true,
  //       message: "okay"
  //     };
  //   }
}
