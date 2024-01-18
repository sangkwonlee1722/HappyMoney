import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";

@ApiTags("Posts")
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 게사글 작성
   * @param createUserDto 카테고리, 제목, 내용
   * @param userId 유저아이디
   * @param nickName 닉네임
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@UserInfo() user: User, @Body() createPostDto: CreatePostDto) {
    const { id: userId, nickName } = user;
    await this.postService.create(userId, nickName, createPostDto);
    return { success: true, message: "okay" };
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
   * 게시글 상세 조회
   * @Param id 게시글의 아이디
   * @returns 상세 글
   */
  @Get(":id")
  async findOne(@Param("id") id: number) {
    const data = await this.postService.findOne(+id);
    return { success: true, message: "okay", data: data };
  }

  /**
   * 게시글 수정
   * @Param id 게시글의 아이디
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  async update(@UserInfo() user: User, @Param("id") id: number, @Body() updatePostDto: UpdatePostDto) {
    const data = await this.postService.findOne(+id);
    if (!data) {
      throw new NotFoundException({ success: false, message: "해당 글이 없습니다." });
    }
    const userId: number = user.id;
    if (data.userId !== userId) {
      throw new UnauthorizedException({ success: false, message: "권한이 없습니다." });
    }
    const isUpdated = await this.postService.update(+id, updatePostDto);
    if (!isUpdated) {
      throw new BadRequestException({ success: false, message: "글쓴이가 아닙니다." });
    } else if (isUpdated) {
      return { success: true, message: "okay" };
    }
  }

  /**
   * 게시글 삭제
   * @Param id 게시글의 아이디
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  async remove(@UserInfo() user: User, @Param("id") id: number) {
    const data = await this.postService.findOne(+id);
    if (!data) {
      throw new NotFoundException({ success: false, message: "해당 글이 없습니다." });
    }
    const userId: number = user.id;
    if (data.userId !== userId) {
      throw new BadRequestException({ success: false, message: "글쓴이가 아닙니다." });
    }
    await this.postService.remove(data);
    return { success: true, message: "okay" };
  }
}
