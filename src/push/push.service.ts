import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CreatePushDto } from "./dto/create-push.dto";
import { UpdatePushDto } from "./dto/update-push.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Push } from "./entities/push.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { sendNotification } from "web-push";
import { Payload } from "./push-config";

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(Push)
    private readonly pushRepository: Repository<Push>,

    private readonly configService: ConfigService
  ) {}

  async findAllMyPushNoti(userId: number): Promise<Push[]> {
    const pushNotis = await this.pushRepository
      .createQueryBuilder("p")
      .where("p.userId=:userId", { userId })
      .orderBy("p.createdAt", "DESC")
      .getMany();

    return pushNotis;
  }

  async findOnePushalarm(pushId: number, userId: number): Promise<Push> {
    const push: Push = await this.pushRepository.findOne({ where: { id: pushId } });

    if (!push) {
      throw new NotFoundException({ success: false, message: "해당하는 알림을 찾지 못했습니다." });
    }

    if (push.userId !== userId) {
      throw new UnauthorizedException({ success: false, message: "권한이 없습니다." });
    }

    return push;
  }

  async updateAllPushNotisReadStatus(userId: number): Promise<void> {
    await this.pushRepository.update({ userId, isRead: false }, { isRead: true });
  }

  async updateOnePushNotiReadStatus(userId: number, pushId: number): Promise<void> {
    await this.findOnePushalarm(pushId, userId);

    await this.pushRepository.update({ userId, id: pushId, isRead: false }, { isRead: true });
  }

  async removeOnePushNoti(pushId: number, userId: number): Promise<void> {
    const pushNoti: Push = await this.findOnePushalarm(pushId, userId);

    await this.pushRepository.delete({ id: pushId });
  }

  async removeAllMyPushNotis(userId: number): Promise<void> {
    await this.pushRepository.delete({ userId });
  }

  async countMyUnReadNotis(userId: number): Promise<number> {
    const count: number = await this.pushRepository.countBy({ userId, isRead: false });

    return count;
  }

  /* 유저에게 웹 푸시를 보내는 함수 */
  async sendPush(userSubscription, payload: Payload): Promise<void> {
    const options = {
      TTL: 24 * 60 * 60,
      vapidDetails: {
        subject: "mailto:chzhgod@gmail.com",
        publicKey: this.configService.get<string>("VAPID_PUBLIC_KEY"),
        privateKey: this.configService.get<string>("VAPID_PRIVATE_KEY")
      }
    };

    const jsonPayload = payload.getJsonPayload();

    try {
      await sendNotification(userSubscription, jsonPayload, options);
    } catch (error) {
      console.error("WebPushError:", error);
    }
  }
}
