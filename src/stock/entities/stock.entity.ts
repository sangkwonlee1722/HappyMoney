import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "stocks" })
export class Stock extends BaseEntity {
  @Column({ comment: "해당 종목의 코드", unique: true })
  srtnCd: string;

  @Column({ comment: "해당 종목 한글 이름" })
  itmsNm: string;

  @Column({ comment: "시장 구분 KOSPI | KOSDAQ" })
  mrktCtg: string;

  @Column({ comment: "해당 종목의 시가 총액" })
  mrktTotAmt: string;

  @Column({ comment: "상장주식수" })
  lstgStCnt: string;
}
