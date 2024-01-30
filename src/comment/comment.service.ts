// comment.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Post } from "src/post/entities/post.entity";
import { PostService } from "src/post/post.service";
import { Push, ServiceType } from "src/push/entities/push.entity";
import { ConfigService } from "@nestjs/config";
import { PushService } from "src/push/push.service";
import { Payload } from "src/push/push-config";
import { User } from "src/user/entities/user.entity";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private readonly postService: PostService,
    private readonly pushService: PushService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(user: User, postId: number, createCommentDto: CreateCommentDto) {
    // 게시글 존재 여부 확인
    const post = await this.postService.findOne(postId);
    if (!post) {
      throw new NotFoundException({ success: false, message: "게시글을 찾을 수 없습니다." });
    }

    /* 푸시-알림 테이블에 데이터 추가 트랜잭션 s */
    await this.entityManager.transaction(async (em) => {
      /* 댓글 생성 */
      const comment: Comment = em.create(Comment, {
        content: createCommentDto.content,
        commentUser: { id: user.id },
        post: { id: postId }
      });

      await em.save(Comment, comment);

      // 내가 쓴 게시글에 다른 사람이 댓글을 달 경우
      if (post.userId !== user.id) {
        /* 푸시 테이블에 데이터 생성 */
        const pushData: Push = em.create(Push, {
          userId: post.userId,
          serviceType: ServiceType.Comment,
          contents1: post.title,
          contents2: user.nickName,
          contentId: post.id
        });

        await em.save(Push, pushData);
      }
    });
    /* 푸시-알림 테이블에 데이터 추가 트랜잭션 e */

    /* 푸시 알람 보내는 함수 */
    if (post.userId !== user.id) {
      await this.sendCommentPush(post);
    }
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

  async getMyAllComments(userId: number, query: PaginatePostDto) {
    const [comments, count]: [Comment[], number] = await this.commentRepository
      .createQueryBuilder("c")
      .leftJoin("c.post", "cp")
      .loadRelationCountAndMap("cp.commentNumbers", "cp.comments")
      .leftJoin("c.commentUser", "cu")
      .where("cu.id=:userId", { userId })
      .select(["c.id", "c.createdAt", "c.updatedAt", "c.content", "cp.title", "cp.id"])
      .skip(query.take * (query.page - 1))
      .take(query.take)
      .orderBy("c.createdAt", query.order__createdAt)
      .getManyAndCount();

    return { comments, count };
  }

  async sendCommentPush(post: Post) {
    const userSubscription = Object(post.user.subscription);

    const url = `http://localhost:3000/views/post-read.html?id=${post.id}`;
    const payload = new Payload(`[${post.title}]에 댓글이 달렸습니다.`, url);
    console.log("payload: ", payload);

    await this.pushService.sendPush(userSubscription, payload);
  }
}
