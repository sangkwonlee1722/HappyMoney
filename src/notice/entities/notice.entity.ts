import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "notices" })
export class Notice extends BaseEntity {
  @IsNumber()
  @Column()
  userId: number;

  /**
   * @example "통합 공지사항"
   * @requires true
   */
  @IsNotEmpty({ message: "제목을 입력해 주세요." })
  @IsString()
  @Column()
  title: string;

  /**
   * @example "욕하지 마세요."
   * @requires true
   */
  @IsNotEmpty({ message: "내용을 입력해 주세요." })
  @IsString()
  @Column({ type: "text", nullable: false })
  contents: string;

  @Column({ nullable: true })
  filePath?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
