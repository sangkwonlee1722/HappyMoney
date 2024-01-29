import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, Query } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

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
  async getNotice(@Query() query: PaginatePostDto) {
    const { notice, count } = await this.noticeService.getNotice(query);
    return {
      success: true,
      message: "okay",
      list: notice,
      total: count
    };
  }

  /**
   * 공지사항 특정 조회
   * @param id
   * @returns
   */
  @Get(":id")
  async findOne(@Param("id") id: number) {
    const notice = await this.noticeService.findOne(id);
    return {
      success: true,
      message: "okay",
      data: notice
    };
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
  async update(@Param("id") id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    const updatedNotice = await this.noticeService.update(id, updateNoticeDto);
    return {
      success: true,
      message: "okay",
      data: updatedNotice
    };
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
  async remove(@Param("id") id: number) {
    await this.noticeService.remove(id);
    return {
      success: true,
      message: "okay"
    };
  }
}
