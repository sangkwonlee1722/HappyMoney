import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "src/common/dto/paginate.dto";
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
    await this.postRepository.save({
      category,
      userId,
      nickName,
      title,
      contents
    });
  }

  async findAll(query: PaginatePostDto) {
    const [posts, count]: [Post[], number] = await this.postRepository
      .createQueryBuilder("p")
      .select(["p.id", "p.category", "p.nickName", "p.title", "p.createdAt"])
      .loadRelationCountAndMap("p.commentNumbers", "p.comments")
      .skip(query.take * (query.page - 1))
      .take(query.take)
      .orderBy("p.createdAt", query.order__createdAt)
      .getManyAndCount();

    return { posts, count };
  }

  async findOne(id: number) {
    const data = await this.postRepository.findOne({
      where: { id },
      relations: ["comments", "user"]
    });
    return data;
  }

  async findMyPostsById(userId: number) {
    const posts: Post[] = await this.postRepository
      .createQueryBuilder("p")
      .where("p.userId=:userId", { userId })
      .select(["p.id", "p.category", "p.nickName", "p.title", "p.createdAt"])
      .loadRelationCountAndMap("p.commentNumbers", "p.comments")
      .orderBy("p.createdAt", "DESC")
      .getMany();

    return posts;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const data = await this.postRepository.update({ id }, updatePostDto);
    return data.affected;
  }

  async remove(data: object) {
    await this.postRepository.softRemove(data);
  }
}
