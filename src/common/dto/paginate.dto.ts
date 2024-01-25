import { IsIn, IsNumber, IsOptional } from "class-validator";

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  // 정렬
  // createdAt -> 생성된 시간의 내림차/오름차 순으로 정렬
  // Ascending / Descending
  @IsIn(["ASC", "DESC"])
  @IsOptional()
  order__createdAt: "ASC" | "DESC" = "DESC";

  // 몇개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take?: number = 10;
}
