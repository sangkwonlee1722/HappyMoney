import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}
  async create(userId: number, nickName: string, createPostDto: CreatePostDto) {
    const { category, title, contents } = createPostDto;
    const data = await this.postRepository.save({
      category,
      userId,
      nickName,
      title,
      contents
    });
    return data;
  }

  async findAll() {
    const data = await this.postRepository.find({
      select: ["id", "category", "userId", "nickName", "title", "createdAt"],
      order: { createdAt: "DESC" }
    });
    return data;
  }

  async findOne(id: number) {
    const data = await this.postRepository.findOne({
      where: { id }
    });
    return data;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const { category, title, contents } = updatePostDto;
    const data = await this.postRepository.update(
      {
        id,
        userId
      },
      { category, title, contents }
    );
    return data.affected;
  }

  async remove(id: number, userId: number) {
    const data = await this.postRepository.softDelete({
      id,
      userId
    });
    return data.affected;
  }
}
