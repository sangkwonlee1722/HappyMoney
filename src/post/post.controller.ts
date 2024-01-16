import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("게시판")
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 게사글 작성
   * @param createUserDto 카테고리아이디, 제목, 내용
   * @param userId 토큰의 유저아이디
   * @returns 저장된 글
   */
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const userId: number = 1;
    const data = await this.postService.create(userId, createPostDto);
    return { success: true, message: "okay", data: data };
  }

  /**
   * 게시글 전체조회
   * @returns 전체 글
   */
  @Get()
  async findAll() {
    const data = await this.postService.findAll();
    return { success: true, message: "okay", data: data };
  }

  /**
   * 게시글 특정조회
   * @Param id 게시글의 아이디
   * @returns 특정 글
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.postService.findOne(+id);
    return { success: true, message: "okay", data: data };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postService.update(+id, updatePostDto);
    const data = this.postService.findOne(+id);
    return { success: true, message: "okay", data: data };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.postService.remove(+id);
    return { success: true, message: "okay" };
  }
}
