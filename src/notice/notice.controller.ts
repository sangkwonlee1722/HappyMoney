import { Controller, Post, Body, Get, Param, Patch, Delete } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ApiTags } from "@nestjs/swagger";
import { UpdateNoticeDto } from "./dto/update-notice.dto";

@ApiTags("notices")
@Controller("notices")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // 공지사항 작성
  @Post()
  async create(@Body() createNoticeDto: CreateNoticeDto) {
    await this.noticeService.create(createNoticeDto);
    return {
      success: true,
      message: "okay"
    };
  }

  // 공지사항 전체 조회
  @Get()
  findAll() {
    return this.noticeService.findAll();
  }

  // 공지사항 특정 조회
  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.noticeService.findOne(id);
  }

  // 공지사항 수정
  @Patch(":id")
  update(@Param("id") id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(id, updateNoticeDto);
  }

  // 공지사항 삭제
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.noticeService.remove(id);
  }
}
