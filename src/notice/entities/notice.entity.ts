import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "notices" })
export class Notice extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @Column({ nullable: true })
  filePath?: string;
}
