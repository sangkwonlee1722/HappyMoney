import { BadRequestException, Controller, Get, Patch, Query } from "@nestjs/common";
import { StockService } from "./stock.service";
import { ApiTags } from "@nestjs/swagger";
import { Stock } from "./entities/stock.entity";

@ApiTags("OpenAPI")
@Controller("stock")
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Bearer 토큰
   * @returns
   */
  @Get("token")
  async getTk() {
    const token = await this.stockService.getTk();
    return { token };
  }

  /**
   * WebSocket 토큰
   * @returns
   */
  @Get("skToken")
  async getSk() {
    const token = await this.stockService.getSk();
    return { token };
  }

  /**
   * 거래량 순위
   * @returns
   */
  @Get("stockRank")
  async getStockRank() {
    const list = await this.stockService.getStockRank();
    return { list };
  }

  @Patch("upadateStock")
  async updateStockValue() {
    await this.stockService.updateStockAndRank();
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 주식현재가 호가
   * @param code
   * @returns
   */
  @Get("stockPrice")
  async getStockPrice(@Query("code") code: string) {
    const item = await this.stockService.getStockPrice(code);
    return { item };
  }

  /**
   * 주식 종목 키워드로 검색하기
   * @param keyword
   * @returns
   */
  @Get("search")
  async getStocksBySearchKeyword(@Query("keyword") keyword: string) {
    if (!keyword) {
      throw new BadRequestException({ success: false, message: "키워드를 입력해주세요." });
    }
    const stocks: Stock[] = await this.stockService.findStocksByKeyword(keyword);

    return {
      success: true,
      message: "okay",
      data: stocks
    };
  }
}
