import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "src/accounts/accounts.module";
import { StockHolding } from "./entities/stockHolding.entity";
import { StockModule } from "src/stock/stock.module";
import { StockService } from "src/stock/stock.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, StockHolding]), AccountsModule, StockModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
