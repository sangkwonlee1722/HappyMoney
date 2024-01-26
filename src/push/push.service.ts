import { Injectable } from "@nestjs/common";
import { CreatePushDto } from "./dto/create-push.dto";
import { UpdatePushDto } from "./dto/update-push.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Push } from "./entities/push.entity";
import { Repository } from "typeorm";
import { Comment } from "src/comment/entities/comment.entity";
import { Post } from "src/post/entities/post.entity";
import { Notice } from "src/notice/entities/notice.entity";
import { Twit } from "src/twit/entities/twit.entity";

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(Push)
    private readonly pushRepository: Repository<Push>
  ) {}

  create(createPushDto: CreatePushDto) {
    return "This action adds a new push";
  }

  async findAllMyPushNoti(userId: number): Promise<Push[]> {
    const pushNotis = await this.pushRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect(Notice, "n", 'p.serviceId = n.id AND p.servcieType = "게시글"')
      .leftJoinAndSelect(Comment, "c", 'p.serviceId = c.id AND p.servcieType = "댓글"')
      .leftJoinAndSelect(Twit, "t", 'p.serviceId = t.id AND p.servcieType = "쪽지"')
      .where("p.userId=:userId", { userId })
      .getMany();

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
}
