import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/common/entities/base.entity";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";
// import { Category } from "src/category/entities/category.entity";

@Entity({
  name: "posts"
})
export class Post extends BaseEntity {
  @IsNumber()
  @Column({ nullable: false })
  categoryId: number;

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
  @Column({ type: "varchar", length: 255, nullable: false })
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

  @ManyToOne(() => User, (user) => user.post)
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  user: User;

  // @ManyToOne(() => Category)
  // category: Category;
}
