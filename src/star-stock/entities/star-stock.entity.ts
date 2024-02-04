import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Stock } from "../../stock/entities/stock.entity";

@Entity({ name: "starStocks" })
export class StarStock extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  stockId: number;

  @ManyToOne(() => User, (user) => user.starStocks)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Stock, (stock) => stock.starStocks)
  @JoinColumn({ name: "stock_id" })
  stock: Stock;
}
