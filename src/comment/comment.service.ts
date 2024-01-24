// comment.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Post } from "src/post/entities/post.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    // 게시글 존재 여부 확인
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      commentUser: { id: userId },
      post: { id: postId }
    });
    return this.commentRepository.save(comment);
  }

  async findCommentsByPost(postId: number): Promise<any[]> {
    const comments = await this.commentRepository
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.commentUser", "cu")
      .where("c.post = :postId", { postId })
      .select(["c.id", "c.content", "c.createdAt", "c.updatedAt", "cu.nickName"])
      .orderBy("c.createdAt", "DESC")
      .getMany();

    return comments;
  }

  async update(userId: number, commentId: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ["commentUser"] });

    if (!comment) throw new NotFoundException({ success: false, message: "댓글을 찾을 수 없습니다." });

    if (comment.commentUser.id !== userId)
      throw new UnauthorizedException({ success: false, message: "댓글 수정 권한이 없습니다." });

    await this.commentRepository.update(commentId, updateCommentDto);

    return await this.commentRepository.findOne({ where: { id: commentId }, relations: ["commentUser"] });
  }

  async remove(userId: number, commentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ["commentUser"] });

    if (!comment) throw new NotFoundException({ success: false, message: "댓글을 찾을 수 없습니다." });
    if (comment.commentUser.id !== userId)
      throw new UnauthorizedException({ success: false, message: "댓글 수정 권한이 없습니다." });

    await this.commentRepository.softRemove(comment);
  }

  async getMyAllComments(userId: number): Promise<Comment[]> {
    const comments = await this.commentRepository
      .createQueryBuilder("c")
      .leftJoin("c.post", "cp")
      .loadRelationCountAndMap("cp.commentNumbers", "cp.comments")
      .leftJoin("c.commentUser", "cu")
      .where("cu.id=:userId", { userId })
      .select(["c.id", "c.createdAt", "c.updatedAt", "c.content", "cp.title", "cp.id"])
      .getMany();

    return comments;
  }
}
