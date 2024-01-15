import { IsNotEmpty, IsOptional, IsInt, IsString } from "class-validator";

export class CreateNoticeDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  contents: string;

  @IsString()
  @IsOptional()
  filePath?: string;
}
