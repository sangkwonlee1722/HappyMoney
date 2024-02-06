import { PickType } from "@nestjs/swagger";
import { Order, OrderStatus } from "../entities/order.entity";
import { IsNotEmpty } from "class-validator";

export class CreateOrderDto extends PickType(Order, ["stockName", "stockCode", "orderNumbers", "price"]) {
  @IsNotEmpty()
  status: OrderStatus;
}
