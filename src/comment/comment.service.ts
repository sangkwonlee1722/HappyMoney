// comment.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Post } from "src/post/entities/post.entity";
import { PostService } from "src/post/post.service";
import { MessageType, Push, ServiceType } from "src/push/entities/push.entity";
import { ConfigService } from "@nestjs/config";
import { sendNotification } from "web-push";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    private readonly postService: PostService,
    private readonly configService: ConfigService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto) {
    // 게시글 존재 여부 확인
    // const post = await this.postRepository.findOneBy({ id: postId });

    const post = await this.postService.findOne(postId);
    if (!post) {
      throw new NotFoundException({ success: false, message: "게시글을 찾을 수 없습니다." });
    }
    const postUserId: number = post.userId;
    const postTitle: string = post.title;
    const value = Object(post.user.subscription);
    console.log("value: ", value);

    const pushSubscription = {
      endpoint: value.endpoint,
      keys: {
        p256dh: value.keys.p256dh,
        auth: value.keys.auth
      }
    };

    /* 푸시-알림 테이블에 데이터 추가 트랜잭션 */
    await this.entityManager.transaction(async (em) => {
      /* 댓글 생성 */
      const comment = em.create(Comment, {
        content: createCommentDto.content,
        commentUser: { id: userId },
        post: { id: postId }
      });

      await em.save(Comment, comment);

      // 내가 쓴 게시글에 다른 사람이 댓글을 달 경우
      if (postUserId !== userId) {
        /* 푸시-알림 데이터 생성 */
        const pushData: Push = em.create(Push, {
          userId: postUserId,
          servcieType: ServiceType.Comment,
          message: MessageType.Comment,
          contents: postTitle
        });

        await em.save(Push, pushData);

        const options = {
          TTL: 24 * 60 * 60,
          vapidDetails: {
            subject: "mailto:chzhgod@gmail.com",
            publicKey: "BJoW2C5jQj4J7ijvAzoLhAccxODbLiiphl2PLWe_6cIcpsutw7ntsD33_oxmmK94l3Zg1dun0kIn5pNlku-URVc",
            privateKey: "YGNiPvb3AScoKshKU6GuTd9Z0KT5WHn7M8ZLmAI652k"
          }
        };

        const payload = {
          title: "HAPPY MONEY",
          body: "제발되기를 ㅎㅎㅎ",
          tag: "댓글"
        };

        const jsonPayload = JSON.stringify(payload); // 수정해봐요 !!

        try {
          await sendNotification(pushSubscription, jsonPayload, options);
        } catch (error) {
          console.error("WebPushError:", error);
        }
      }
    });
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
