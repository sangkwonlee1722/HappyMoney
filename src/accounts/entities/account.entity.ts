import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Order } from "src/order/entities/order.entity";
import { StockHolding } from "src/order/entities/stockHolding.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity({ name: "accounts" })
export class Account extends BaseEntity {
  /**
   * 계좌이름
   * @example "2차 전지"
   * @requires true
   */
  @IsString()
  @IsNotEmpty({ message: "계좌 이름을 지정해주세요." })
  @MaxLength(6, { message: "계좌 이름은 6글자를 넘을 수 없습니다." })
  @Column({ nullable: false })
  name: string;

  @Column({ default: 100000000 })
  point: number;

  @Column({ default: 100000000 })
  totalValue: number;

  @IsString()
  @Column({ nullable: false, unique: true })
  accountNumber: string;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Order, (order) => order.account, { cascade: ["soft-remove"] })
  orders: Order[];

  @OneToMany(() => StockHolding, (stockHolding) => stockHolding.account, { cascade: ["soft-remove"] })
  stockHoldings: StockHolding[];
}
