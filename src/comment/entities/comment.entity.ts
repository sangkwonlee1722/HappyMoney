import { Entity, Column, ManyToOne } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;
}
