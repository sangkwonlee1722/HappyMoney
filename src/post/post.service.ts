import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async create(userId: number, createPostDto: CreatePostDto) {
    const { categoryId, title, contents } = createPostDto;
    const userData = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null }
    });
    const nickName: string = userData.nickName;
    const data = await this.postRepository.save({
      categoryId,
      userId,
      nickName,
      title,
      contents
    });
    return data;
  }

  async findAll() {
    const data = await this.postRepository.find({
      where: { deletedAt: null },
      select: ["id", "categoryId", "userId", "nickName", "title", "createdAt"],
      order: { createdAt: "DESC" }
    });
    return data;
  }

  async findOne(id: number) {
    const data = await this.postRepository.findOne({
      where: { id, deletedAt: null }
    });
    return data;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const { categoryId, title, contents } = updatePostDto;
    const data = await this.postRepository.update(
      {
        id,
        userId,
      },
      { categoryId, title, contents },
    );
    return data.affected;
  }

  remove(id: number, userId: number) {
    return `This action removes a #${id} post`;
  }
}
