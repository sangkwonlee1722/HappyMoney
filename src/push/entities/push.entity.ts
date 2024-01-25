import { boolean } from "joi";
import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

enum ServiceType {
  Comment = "댓글",
  Notice = "공지",
  Stock = "주식",
  Twit = "쪽지"
}

@Entity({ name: "push" })
export class Push extends BaseEntity {
  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  serviceId: number;

  @Column({ type: "enum", enum: ServiceType, nullable: false })
  servcieType: ServiceType;

  @Column({ nullable: false, default: false })
  isRead: boolean;

  @Column({ nullable: false })
  message: string;
}
