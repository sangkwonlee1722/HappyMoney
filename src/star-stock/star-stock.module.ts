import { Module } from "@nestjs/common";
import { StarStockService } from "./star-stock.service";
import { StarStockController } from "./star-stock.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StarStock } from "./entities/star-stock.entity";

@Module({
  imports: [TypeOrmModule.forFeature([StarStock])],
  controllers: [StarStockController],
  providers: [StarStockService]
})
export class StarStockModule {}
