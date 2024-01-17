import { Entity, Column, ManyToOne } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { IsNotEmpty, IsString } from "class-validator";

@Entity()
export class Comment extends BaseEntity {
  @IsNotEmpty({ message: "댓글을 입력해 주세요." })
  @IsString()
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;
}
