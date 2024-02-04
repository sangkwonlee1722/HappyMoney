import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StarStock } from "./entities/star-stock.entity";
import { Repository } from "typeorm";

@Injectable()
export class StarStockService {
  constructor(
    @InjectRepository(StarStock)
    private readonly starStockRepository: Repository<StarStock>
  ) {}

  async createMyStarStock(userId: number, stockCode: string) {
    const existStock: StarStock = await this.checkStarStockByStockCode(userId, stockCode);

    if (existStock) {
      throw new ConflictException("관심 종목으로 이미 추가하였습니다.");
    }

    await this.starStockRepository
      .createQueryBuilder()
      .insert()
      .into(StarStock)
      .values({ userId, stockCd: stockCode })
      .execute();
  }

  async getMyStarStocks(userId: number) {
    const starStocks: StarStock[] = await this.starStockRepository
      .createQueryBuilder("ss")
      .leftJoinAndSelect("ss.stock", "s")
      .select(["ss.id", "ss.userId", "s.srtnCd", "s.itmsNm", "s.mrktCtg", "s.mrktTotAmt", "s.lstgStCnt", "s.clpr"])
      .where("ss.userId=:userId", { userId })
      .orderBy("ss.createdAt", "DESC")
      .getMany();
    return starStocks;
  }

  async checkStarStockByStockCode(userId: number, stockCode: string) {
    const stock: StarStock = await this.starStockRepository
      .createQueryBuilder("ss")
      .where("ss.userId=:userId", { userId })
      .andWhere("ss.stockCd=:stockCode", { stockCode })
      .getOne();

    return stock;
  }

  async deleteStarStock(userId: number, stockCode: string) {
    const stock: StarStock = await this.checkStarStockByStockCode(userId, stockCode);

    if (!stock) {
      throw new NotFoundException("해당하는 주식을 찾을 수 없습니다.");
    }

    await this.starStockRepository.remove(stock);
  }
}
