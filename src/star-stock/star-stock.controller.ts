import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { StarStockService } from "./star-stock.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/user/entities/user.entity";
import { UserInfo } from "src/common/decorator/user.decorator";
import { StarStock } from "./entities/star-stock.entity";
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@ApiTags("StarStock")
@Controller("star-stock")
export class StarStockController {
  constructor(private readonly starStockService: StarStockService) {}

  /**
   * 관심 주식 추가하기
   * @param user
   * @param stockCode
   * @returns
   */
  @Post(":stockCode")
  async createMyStarStock(
    @UserInfo()
    user: User,
    @Param("stockCode")
    stockCode: string
  ) {
    await this.starStockService.createMyStarStock(user.id, stockCode);

    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 관심주식 조회하기
   * @param user
   * @returns
   */
  @Get()
  async getMyStarStocks(@UserInfo() user: User) {
    const starStocks: StarStock[] = await this.starStockService.getMyStarStocks(user.id);
    return {
      success: true,
      message: "okay",
      starStocks
    };
  }

  /**
   * 관심 종목 삭제하기
   * @param user
   * @param stockCode
   * @returns
   */
  @Delete(":stockCode")
  async deleteStarStock(
    @UserInfo()
    user: User,
    @Param("stockCode")
    stockCode: string
  ) {
    await this.starStockService.deleteStarStock(user.id, stockCode);

    return {
      success: true,
      message: "okay"
    };
  }
}
