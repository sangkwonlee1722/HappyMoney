import { Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [StockController],
  providers: [StockService]
})
export class StockModule {}
