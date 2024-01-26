import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTwitDto } from "./dto/create-twit.dto";
import { User } from "src/user/entities/user.entity";
import { Twit } from "./entities/twit.entity";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { UserService } from "src/user/user.service";
import { PaginatePostDto } from "src/common/dto/paginate.dto";
import { Push, ServiceType } from "src/push/entities/push.entity";
import { Payload } from "src/push/push-config";
import { PushService } from "src/push/push.service";

@Injectable()
export class TwitService {
  findUserByNickname: any;
  constructor(
    @InjectRepository(Twit)
    private readonly twitRepository: Repository<Twit>,
    private readonly userService: UserService,
    private readonly pushService: PushService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async sendTwit({ id, nickName }: User, { contents, receiveNickname }: CreateTwitDto) {
    const receiver = await this.userService.findUserByNickname(receiveNickname);

    if (receiver.id === id) throw new BadRequestException({ success: false, message: "나에게 보낼 수 없습니다." });
    if (!receiver) throw new NotFoundException({ success: false, message: "수신자를 찾을 수 없습니다." });
    console.log(receiver);

    const sendTwit: Twit = this.twitRepository.create({
      senderId: id,
      receiveId: receiver.id,
      senderName: nickName,
      receiverName: receiver.nickName,
      contents
    });

    /* 쪽지 발송 시 푸시-알림 테이블에 데이터 추가 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      await em.save(Twit, sendTwit);

      console.log(sendTwit);

      const pushData: Push = em.create(Push, {
        userId: receiver.id,
        servcieType: ServiceType.Twit,
        contents: sendTwit.contents
      });

      await em.save(Push, pushData);
    });
    /* 쪽지 발송 시 푸시-알림 테이블에 데이터 추가 트랜잭션 e */

    await this.sendTwitPush(sendTwit, receiver);

    return sendTwit;
  }

  async getSendTwit({ id }: User, dto: PaginatePostDto) {
    const [getTwits, count] = await this.twitRepository.findAndCount({
      where: { senderId: id, isDeletedBySender: false },
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });

    if (getTwits.length === 0) return { success: false, message: "보낸 쪽지가 없습니다." };

    return {
      getTwits,
      count
    };
  }

  async getReceiveTwit({ id }: User, dto: PaginatePostDto) {
    const [getTwits, count] = await this.twitRepository.findAndCount({
      where: { receiveId: id, isDeletedByReceiver: false },
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });
    if (getTwits.length === 0) return { success: false, message: "받은 쪽지가 없습니다." };

    return {
      getTwits,
      count
    };
  }

  async getTwitDetail(id: number, user: User) {
    await this.twitRepository.update({ id, receiveId: user.id }, { isRead: true });

    const getTwitDetail = await this.twitRepository.findOne({ where: { id } });

    if (!getTwitDetail) throw new NotFoundException({ success: false, message: "해당 쪽지를 찾을 수 없습니다." });

    return getTwitDetail;
  }

  async deleteSendTwit(id: number, user: User) {
    await this.twitRepository.update({ id, senderId: user.id }, { isDeletedBySender: true });

    const deleteSendTwit = await this.twitRepository.findOne({ where: { id, senderId: user.id } });

    if (!deleteSendTwit) throw new BadRequestException({ success: false, message: "삭제할 수 없습니다." });

    return deleteSendTwit;
  }

  async deleteReceiveTwit(id: number, user: User) {
    await this.twitRepository.update({ id, receiveId: user.id }, { isDeletedByReceiver: true });

    const deleteReceiveTwit = await this.twitRepository.findOne({ where: { id, receiveId: user.id } });

    if (!deleteReceiveTwit) throw new BadRequestException({ success: false, message: "삭제할 수 없습니다." });

    return deleteReceiveTwit;
  }

  async sendTwitPush(sendTwit: Twit, receiver: User) {
    console.log("sendTwit: ", sendTwit);
    const userSubscription = Object(receiver.subscription);
    const payload = new Payload(`[${sendTwit.senderName}]님이 쪽지를 보냈습니다.`);

    await this.pushService.sendPush(userSubscription, payload);
  }
}
