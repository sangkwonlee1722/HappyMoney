// comment.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("comments")
@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 댓글 작성
   * @param createCommentDto
   * @returns
   */
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  /**
   * 댓글 전체 조회
   * @returns
   */
  @Get()
  async findAll() {
    return this.commentService.findAll();
  }

  /**
   * 댓글 수정
   * @param id
   * @param updateCommentDto
   * @returns
   */
  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(id, updateCommentDto);
  }

  /**
   * 댓글 삭제
   * @param id
   * @returns
   */
  @Delete(":id")
  async remove(@Param("id") id: number) {
    return this.commentService.remove(id);
  }
}
