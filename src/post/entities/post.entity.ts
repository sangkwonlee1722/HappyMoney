import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { Comment } from "src/comment/entities/comment.entity";

@Entity({
  name: "posts"
})
export class Post extends BaseEntity {
  /**
   * 말머리
   * @example "잡담"
   * @requires true
   */
  @IsNotEmpty({ message: "카테고리 비입력." })
  @IsString()
  @Column({ type: "varchar", length: 31, nullable: false })
  category: string;

  @IsNumber()
  @Column({ nullable: false })
  userId: number;

  @IsString()
  @Column({ nullable: false })
  nickName: string;

  /**
   * 글 제목
   * @example "테슬라 관련 정보 공유합니다"
   * @requires true
   */
  @IsNotEmpty({ message: "제목을 입력해 주세요." })
  @IsString()
  @Column({ type: "varchar", length: 63, nullable: false })
  title: string;

  /**
   * 글 내용
   * @example "방탄 트럭을 출시했다고 합니다."
   * @requires true
   */
  @IsNotEmpty({ message: "내용을 입력해 주세요." })
  @IsString()
  @Column({ type: "text", nullable: false })
  contents: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: ["soft-remove"] })
  comments: Comment[];
}
