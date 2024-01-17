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

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  async findAll() {
    return this.commentService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.commentService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    return this.commentService.remove(id);
  }
}
