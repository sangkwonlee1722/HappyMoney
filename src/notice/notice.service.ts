import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notice } from "./entities/notice.entity";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { UpdateNoticeDto } from "./dto/update-notice.dto";

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>
  ) {}

  // 공지사항 작성
  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const existingNotice = await this.noticeRepository.findOne({ where: { title: createNoticeDto.title } });
    if (existingNotice) {
      throw new ConflictException("동일한 제목의 공지사항이 이미 존재합니다.");
    }

    const notice = this.noticeRepository.create(createNoticeDto);
    await this.noticeRepository.save(notice);
    return notice;
  }

  // 공지사항 전체 조회
  async findAll(): Promise<Notice[]> {
    return this.noticeRepository.find();
  }

  // 공지사항 특정 조회
  async findOne(id: number): Promise<Notice> {
    return this.noticeRepository.findOneBy({ id });
  }

  // 공지사항 수정
  async update(id: number, updateNoticeDto: UpdateNoticeDto): Promise<Notice> {
    await this.noticeRepository.update(id, updateNoticeDto);
    return this.noticeRepository.findOneBy({ id });
  }

  // 공지사항 삭제
  async remove(id: number): Promise<void> {
    await this.noticeRepository.delete(id);
  }
}
