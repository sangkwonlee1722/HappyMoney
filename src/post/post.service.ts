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
  async create(userId: Number, createPostDto: CreatePostDto) {
    const { categoryId, title, contents } = createPostDto;
    const data = await this.postRepository.save({
      categoryId,
      user_id: userId,
      title,
      contents
    });
    return data;
  }

  async findAll() {
    const data = await this.postRepository.find({
      where: { deletedAt: null },
      select: ["id", "categoryId", "userId", "title", "createdAt"],
      order: { createdAt: "DESC" }
    });
    return data;
  }

  async findOne(id: number) {
    const data = await this.postRepository.findOne({
      where: { id, deletedAt: null },
    });
    return data;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
