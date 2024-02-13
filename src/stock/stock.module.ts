import { Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stock } from "./entities/stock.entity";
import { StockGateway } from "./stock.gateway";
import { SlackService } from "src/common/slack/slack.service";
import { AccountsModule } from "src/accounts/accounts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forFeature([Stock]),
    AccountsModule
  ],
  controllers: [StockController],
  providers: [StockService, StockGateway, SlackService],
  exports: [StockService]
})
export class StockModule {}
