import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "src/accounts/accounts.module";
import { StockHolding } from "./entities/stockHolding.entity";
import { StockModule } from "src/stock/stock.module";
import { StockService } from "src/stock/stock.service";
import { BullModule } from "@nestjs/bull";
import { orderProcessor } from "./order.processor";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, StockHolding]),
    AccountsModule,
    StockModule,
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379
      }
    }),
    BullModule.registerQueue({
      name: "orders"
    })
  ],
  controllers: [OrderController],
  providers: [OrderService, orderProcessor]
})
export class OrderModule {}
