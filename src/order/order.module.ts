import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsModule } from "src/accounts/accounts.module";
import { StockHolding } from "./entities/stockHolding.entity";
import { StockModule } from "src/stock/stock.module";
import { BullModule } from "@nestjs/bull";
import { orderProcessor } from "./order.processor";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, StockHolding]),
    AccountsModule,
    StockModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: "localhost",
          port: 6379
          // host: configService.get<string>("REDIS_HOST"),
          // port: configService.get<number>("REDIS_PORT"),
          // password: configService.get<string>("REDIS_PASSWORD")
        }
      })
    }),
    BullModule.registerQueue({
      name: "orders"
    })
  ],
  controllers: [OrderController],
  providers: [OrderService, orderProcessor]
})
export class OrderModule {}
