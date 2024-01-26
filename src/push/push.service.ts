import { Injectable } from "@nestjs/common";
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

  create(createPushDto: CreatePushDto) {
    return "This action adds a new push";
  }

  async findAllMyPushNoti(userId: number): Promise<Push[]> {
    const pushNotis = await this.pushRepository.createQueryBuilder("p").where("p.userId=:userId", { userId }).getMany();

    return pushNotis;
  }

  findOne(id: number) {
    return `This action returns a #${id} push`;
  }

  update(id: number, updatePushDto: UpdatePushDto) {
    return `This action updates a #${id} push`;
  }

  remove(id: number) {
    return `This action removes a #${id} push`;
  }

  async sendPush(userSubscription, payload: Payload) {
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
