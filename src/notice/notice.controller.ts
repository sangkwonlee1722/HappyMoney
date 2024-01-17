import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";

@ApiTags("notices")
@Controller("notices")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 공지사항 작성
   * @param createNoticeDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles("admin")
  @Post()
  async create(@Body() createNoticeDto: CreateNoticeDto, @Request() req) {
    await this.noticeService.create(createNoticeDto, req.user.id);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 공지사항 전체 조회
   * @returns
   */
  @Get()
  findAll() {
    return this.noticeService.findAll();
  }

  /**
   * 공지사항 특정 조회
   * @param id
   * @returns
   */
  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.noticeService.findOne(id);
  }

  /**
   * 공지사항 수정
   * @param id
   * @param updateNoticeDto
   * @returns
   */
  @ApiBearerAuth()
  @Roles("admin")
  @UseGuards(RolesGuard)
  @Patch(":id")
  update(@Param("id") id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(id, updateNoticeDto);
  }

  /**
   * 공지사항 삭제
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @Roles("admin")
  @UseGuards(RolesGuard)
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.noticeService.remove(id);
  }
}
