import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { IsNotEmpty, IsString } from "class-validator";
import { Post } from "src/post/entities/post.entity";
import { Push } from "src/push/entities/push.entity";

@Entity()
export class Comment extends BaseEntity {
  /**
   * 댓글 내용
   * @example "동의합니다."
   * @requires true
   */
  @IsNotEmpty({ message: "댓글을 입력해 주세요." })
  @IsString()
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: "user_id" })
  commentUser: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: "post_id" })
  post: Post;
}
