import { IsNotEmpty, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  accountNum: string;

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
}
