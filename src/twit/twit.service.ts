import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTwitDto } from "./dto/create-twit.dto";
import { User } from "src/user/entities/user.entity";
import { Twit } from "./entities/twit.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "src/user/user.service";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@Injectable()
export class TwitService {
  findUserByNickname: any;
  constructor(
    @InjectRepository(Twit)
    private readonly twitRepository: Repository<Twit>,
    private readonly userService: UserService
  ) {}

  async sendTwit({ id, nickName }: User, { contents, receiveNickname }: CreateTwitDto) {
    const receiver = await this.userService.findUserByNickname(receiveNickname);

    if (receiver.id === id) throw new BadRequestException({ success: false, message: "나에게 보낼 수 없습니다." });
    if (!receiver) throw new NotFoundException({ success: false, message: "수신자를 찾을 수 없습니다." });
    console.log(receiver);

    const sendTwit = await this.twitRepository.save({
      senderId: id,
      receiveId: receiver.id,
      senderName: nickName,
      receiverName: receiver.nickName,
      contents
    });

    console.log(sendTwit);
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
}
