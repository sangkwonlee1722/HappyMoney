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
  UnauthorizedException,
  Query
} from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
// import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

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
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post()
  async create(@UserInfo() user: User, @Body() createPostDto: CreatePostDto) {
    const { title, category } = createPostDto;
    if (title.trim()==="") {
      throw new BadRequestException({ success: false, message: "공백만 사용할 수는 없습니다" });
    };

    // 카테고리 값이 유효한지 검사
    if (!["잡담", "가입인사", "정보", "질문"].includes(category)) {
      throw new BadRequestException();
    }
    const { id: userId, nickName } = user;

    await this.postService.create(userId, nickName, createPostDto);
    return { success: true, message: "okay" };
  }

  /**
   * 게시글 전체조회
   * @returns 전체 글
   */
  @Get()
  async findAll(@Query() query: PaginatePostDto) {
    let { page } = query;
    if (page === null) {
      page = 1;
    }
    const { posts, count } = await this.postService.findAll(query);
    return {
      success: true,
      message: "okay",
      list: posts,
      total: count
    };
  }

  /**
   * 내가 쓴 게시글 조회
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Get("my")
  async findMyPosts(@UserInfo() user: User, @Query() query: PaginatePostDto) {
    const { posts, count } = await this.postService.findMyPostsById(user.id, query);

    return {
      success: true,
      message: "okay",
      lists: posts,
      total: count
    };
  }

  /**
   * 게시글 상세 조회
   * @Param id 게시글의 아이디
   * @returns 상세 글
   */
  @Get(":id")
  async findOne(@Param("id") id: number) {
    const data = await this.postService.findOne(+id);
    if (!data) {
      throw new NotFoundException({ success: false, message: "해당 글이 없습니다." });
    }
    return { success: true, message: "okay", data: data };
  }

  /**
   * 게시글 수정
   * @Param id 게시글의 아이디
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Patch(":id")
  async update(@UserInfo() user: User, @Param("id") id: number, @Body() updatePostDto: UpdatePostDto) {
    const data = await this.postService.findOne(+id);
    if (!data) {
      throw new NotFoundException({ success: false, message: "해당 글이 없습니다." });
    };
    const userId: number = user.id;
    if (data.userId !== userId) {
      throw new UnauthorizedException({ success: false, message: "권한이 없습니다." });
    };
    const { title, category } = updatePostDto;
    if (title.trim()==="") {
      throw new BadRequestException({ success: false, message: "공백만 사용할 수는 없습니다" });
    };
    // 카테고리 값이 유효한지 검사
    if (!["잡담", "가입인사", "정보", "질문"].includes(category)) {
      throw new BadRequestException("유효하지 않은 카테고리입니다.");
    }

    const isUpdated = await this.postService.update(+id, updatePostDto);
    if (!isUpdated) {
      throw new BadRequestException({ success: false, message: "오류 발생." });
    } else if (isUpdated) {
      return { success: true, message: "okay" };
    }
  }

  /**
   * 게시글 삭제
   * @Param id 게시글의 아이디
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
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
