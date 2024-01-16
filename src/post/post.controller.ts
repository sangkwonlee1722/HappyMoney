import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Controller("post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    const data = this.postService.create(createPostDto);
    return { success: true, message: "okay", data: data };
  }

  @Get()
  findAll() {
    const data = this.postService.findAll();
    return { success: true, message: "okay", data: data };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    const data = this.postService.findOne(+id);
    return { success: true, message: "okay", data: data };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
    this.postService.update(+id, updatePostDto);
    const data = this.postService.findOne(+id);
    return { success: true, message: "okay", data: data };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    this.postService.remove(+id);
    return { success: true, message: "okay" };
  }
}
