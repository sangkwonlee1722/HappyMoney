import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "src/accounts/accounts.module";
import { StockHolding } from "./entities/stockHolding.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, StockHolding]), AccountsModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
