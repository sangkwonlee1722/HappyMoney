import { Controller, Get, Post, Body, Patch, Param, UseGuards } from "@nestjs/common";
import { TwitService } from "./twit.service";
import { CreateTwitDto } from "./dto/create-twit.dto";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

@ApiBearerAuth()
@ApiTags("Twits")
@UseGuards(AuthGuard("jwt"))
@Controller("twits")
export class TwitController {
  constructor(private readonly twitService: TwitService) {}

  /**
   * 쪽지 보내기
   * @param createTwitDto
   * @returns
   */
  @Post()
  async sendTwit(@UserInfo() user: User, @Body() createTwitDto: CreateTwitDto) {
    await this.twitService.sendTwit(user, createTwitDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 보낸 쪽지 조회
   * @returns
   */
  @Get("getSend")
  async getSendTwit(@UserInfo() user: User) {
    const getSends = await this.twitService.getSendTwit(user);
    return {
      success: true,
      message: "okay",
      data: getSends
    };
  }

  /**
   * 받은 쪽지 조회
   * @returns
   */
  @Get("getReceive")
  async getReceiveTwit(@UserInfo() user: User) {
    const getReceives = await this.twitService.getReceiveTwit(user);
    return {
      success: true,
      message: "okay",
      data: getReceives
    };
  }

  /**
   * 쪽지 상세 조회
   * @param id
   * @returns
   */
  @Patch(":id")
  async getTwitDetail(@Param("id") id: number, @UserInfo() user: User) {
    const getTwitDetail = await this.twitService.getTwitDetail(id, user);
    return {
      success: true,
      message: "okay",
      data: getTwitDetail
    };
  }

  /**
   * 보낸 쪽지 삭제
   * @param id
   * @returns
   */
  @Patch("sendDelete/:id")
  async deleteSendTwit(@Param("id") id: number, @UserInfo() user: User) {
    const deleteSendTwit = await this.twitService.deleteSendTwit(id, user);
    return {
      success: true,
      message: "okay",
      data: deleteSendTwit
    };
  }

  /**
   * 받은 쪽지 삭제
   * @param id
   * @returns
   */
  @Patch("receiveDelete/:id")
  async deleteReceiveTwit(@Param("id") id: number, @UserInfo() user: User) {
    const deleteReceiveTwit = await this.twitService.deleteReceiveTwit(id, user);
    return {
      success: true,
      message: "okay",
      data: deleteReceiveTwit
    };
  }
}
