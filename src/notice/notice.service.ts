import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notice } from "./entities/notice.entity";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>
  ) {}

  // 공지사항 작성
  async create(createNoticeDto: CreateNoticeDto, userId: number): Promise<Notice> {
    const notice = this.noticeRepository.create({ ...createNoticeDto, user: { id: userId } });
    if (createNoticeDto.title.trim() === "")
      throw new BadRequestException({ success: false, message: "공백만 쓸 수 없습니다" });
    await this.noticeRepository.save(notice);
    return notice;
  }

  // 공지사항 전체 조회
  async getNotice(dto: PaginatePostDto): Promise<{ notice: Notice[]; count: number }> {
    const [notice, count] = await this.noticeRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });

    return {
      notice,
      count
    };
  }

  // 공지사항 특정 조회
  async findOne(id: number): Promise<Notice> {
    const notice = await this.getNoticeById(id);
    return notice;
  }

  // 공지사항 수정
  async update(id: number, updateNoticeDto: UpdateNoticeDto): Promise<Notice> {
    const notice = await this.getNoticeById(id);
    if (updateNoticeDto.title.trim() === "")
      throw new BadRequestException({ success: false, message: "공백만 쓸 수 없습니다" });
    await this.noticeRepository.update(id, updateNoticeDto);
    return this.noticeRepository.findOneBy({ id });
  }

  // 공지사항 삭제
  async remove(id: number): Promise<void> {
    const notice = await this.getNoticeById(id);

    await this.noticeRepository.softRemove(notice);
  }

  private async getNoticeById(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException({ success: false, message: "해당 공지사항을 찾을 수 없습니다." });
    }
    return notice;
  }
}
