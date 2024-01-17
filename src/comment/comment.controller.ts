// comment.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";

@ApiTags("comments")
@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 댓글 작성
   * @param createCommentDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":postId")
  async create(@Param("postId") postId: number, @UserInfo() user: User, @Body() createCommentDto: CreateCommentDto) {
    await this.commentService.create(user.id, postId, createCommentDto);
    return {
      success: true,
      message: "okay"
    };
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
