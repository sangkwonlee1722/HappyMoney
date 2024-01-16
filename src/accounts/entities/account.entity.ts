import { IsNotEmpty, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "accounts" })
export class Account extends BaseEntity {
  /**
   * 계좌이름
   * @example "2차 전지"
   * @requires true
   */
  @IsString()
  @IsNotEmpty({ message: "계좌 이름을 지정해주세요." })
  @Column({ nullable: false })
  name: string;

  @Column({ default: 100000000 })
  point: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  userId: number;
}
