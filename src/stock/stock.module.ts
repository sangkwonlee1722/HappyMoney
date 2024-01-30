import { Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stock } from "./entities/stock.entity";
import { StockGateway } from "./stock.gateway";
import { SlackService } from "src/common/slack/slack.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Stock])
  ],
  controllers: [StockController],
  providers: [StockService, StockGateway, SlackService]
})
export class StockModule {}
