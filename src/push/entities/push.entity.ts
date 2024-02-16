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

@Entity({ name: "push" })
export class Push extends BaseEntity {
  @Column({ nullable: false })
  userId: number;

  @Column({ type: "enum", enum: ServiceType, nullable: false })
  serviceType: ServiceType;

  @Column({ nullable: false, default: false })
  isRead: boolean;

  @Column({ nullable: false, comment: "쪽지 내용 등 사용자에게 보내줄 알림 내용 데이터" })
  contents1: string;

  @Column({ nullable: true, comment: "쪽지 발신자 등 사용자에게 보내줄 알림 내용 데이터2" })
  contents2: string;

  @Column({ type: "simple-array", nullable: true, comment: "주식 이름, 코드", default: null })
  contents3?: any[];

  @Column({ nullable: false, comment: "클릭 시 넘어갈 주소에 사용될 Id값" })
  contentId: number;

  @ManyToOne(() => User, (user) => user.pushNotis)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;
}
