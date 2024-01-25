import { boolean } from "joi";
import { Comment } from "src/comment/entities/comment.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { Twit } from "src/twit/entities/twit.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

export enum ServiceType {
  Comment = "댓글",
  Stock = "주식",
  Twit = "쪽지"
}

export enum MessageType {
  Comment = "회원님이 작성한 게시글에 댓글이 달렸습니다."
}

@Entity({ name: "push" })
export class Push extends BaseEntity {
  @Column({ nullable: false })
  userId: number;

  @Column({ type: "enum", enum: ServiceType, nullable: false })
  servcieType: ServiceType;

  @Column({ nullable: false, default: false })
  isRead: boolean;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  contents: string;

  @ManyToOne(() => User, (user) => user.pushNotis)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;
}
