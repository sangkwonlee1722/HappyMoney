import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notice } from "./entities/notice.entity";
import { CreateNoticeDto } from "./dto/create-notice.dto";

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>
  ) {}

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const notice = this.noticeRepository.create(createNoticeDto);
    await this.noticeRepository.save(notice);
    return notice;
  }

  // 여기에 findAll, findOne, update, remove 등의 메서드 추가
}
