import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "news" })
export class News extends BaseEntity {
  @Column({ comment: "신문사" })
  newspaper: string;

  @Column({ comment: "제목", unique: true })
  title: string;

  @Column({ comment: "해당 기사 링크" })
  link: string;
}