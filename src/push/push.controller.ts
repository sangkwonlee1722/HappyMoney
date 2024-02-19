import { Controller, Get, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { PushService } from "./push.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@ApiTags("Push")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("push")
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 나의 모든 알림 조회
   * @param user
   * @returns
   */
  @Get()
  async findAllMyPushNoti(@UserInfo() user: User) {
    const pushNotis = await this.pushService.findAllMyPushNoti(user.id);
    return {
      success: true,
      message: "okay",
      pushNotis
    };
  }

  /**
   * 안읽은 알림 개수 확인
   * @param user
   * @returns
   */
  @Get("unread-notis")
  async countMyUnReadNotis(@UserInfo() user: User) {
    const unReadNotisCounts = await this.pushService.countMyUnReadNotis(user.id);

    return {
      success: true,
      message: "okay",
      unReadNotisCounts
    };
  }

  /**
   * 나의 모든 푸시알림 다 지우기
   * @param user
   * @returns
   */
  @Delete()
  async removeAllMyPushNotis(
    @UserInfo()
    user: User
  ) {
    await this.pushService.removeAllMyPushNotis(user.id);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 나의 모든 메시지 읽음 처리
   * @param user
   * @returns
   */
  @Patch()
  async updateAllPushNotisReadStatus(@UserInfo() user: User) {
    await this.pushService.updateAllPushNotisReadStatus(user.id);

    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 특정 메시지 읽음 처리
   * @param user
   * @param pushId
   * @returns
   */
  @Patch(":pushId")
  async updateOnePushNotiReadStatus(
    @UserInfo() user: User,
    @Param("pushId")
    pushId: number
  ) {
    await this.pushService.updateOnePushNotiReadStatus(user.id, pushId);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 특정 알림 삭제하기
   * @param pushId
   * @param user
   * @returns
   */
  @Delete(":pushId")
  async removeOnePushNoti(
    @Param("pushId")
    pushId: number,
    @UserInfo()
    user: User
  ) {
    await this.pushService.removeOnePushNoti(pushId, user.id);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 푸시 발송 시 VAPID키 받아오기
   * @returns
   */
  @Get("VAPIDKeys")
  getVAPIDKeys() {
    const keys = {
      publicKey: this.configService.get<string>("HAPPY_PUBLIC_VAPID"),
      privateKey: this.configService.get<string>("HAPPY_PRIVATE_VAPID")
    };
    return keys;
  }
}
