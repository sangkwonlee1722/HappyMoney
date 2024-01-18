import { Controller, Get } from "@nestjs/common";
import { StockService } from "./stock.service";
import { ApiTags } from "@nestjs/swagger";

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
}
