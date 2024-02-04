import { IsString, IsNumber } from "class-validator";
import { Account } from "src/accounts/entities/account.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "stock_holdings" })
export class StockHolding extends BaseEntity {
  @IsNumber()
  @Column({ nullable: false })
  userId: number;

  @IsNumber()
  @Column({ nullable: false })
  accountId: number;

  @IsString()
  @Column({ nullable: false })
  stockName: string;

  @IsString()
  @Column({ nullable: false })
  stockCode: string;

  @IsNumber()
  @Column({ nullable: false })
  numbers: number;

  @IsNumber()
  @Column({ nullable: false })
  ttlPrice: number;

  @ManyToOne(() => User, (user) => user.stockHoldings)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Account, (account) => account.stockHoldings)
  @JoinColumn({ name: "account_id" })
  account: Account;
}
