import { IsString, IsBoolean, IsNumber, IsPositive } from "class-validator";
import { Account } from "src/accounts/entities/account.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

export enum OrderStatus {
  Order = "order",
  Complete = "complete",
  Cancel = "cancel"
}

@Entity({ name: "orders" })
export class Order extends BaseEntity {
  @IsNumber()
  @Column({ nullable: false })
  userId: number;

  @IsNumber()
  @Column({ nullable: false })
  accountId: number;

  /**
   * 주식이름
   * @example "삼성전자"
   * @requires true
   */
  @IsString()
  @Column({ nullable: false })
  stockName: string;

  /**
   * 주식코드
   * @example "005930"
   * @requires true
   */
  @IsString()
  @Column({ nullable: false })
  stockCode: string;

  /**
   * 거래 수
   * @example 1
   * @requires true
   */
  @IsPositive({ message: "양수이어야 합니다." })
  @Column({ nullable: false })
  orderNumbers: number;

  /**
   * 주식가격
   * @example 74000
   * @requires true
   */
  @IsPositive({ message: "양수이어야 합니다." })
  @Column({ nullable: false })
  price: number;

  @IsNumber()
  @Column({ nullable: false })
  ttlPrice: number;

  @IsBoolean()
  @Column({ nullable: false })
  buySell: boolean;

  @Column({ type: "enum", enum: OrderStatus, nullable: false, default: OrderStatus.Order })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Account, (account) => account.orders)
  @JoinColumn({ name: "account_id" })
  account: Account;
}
