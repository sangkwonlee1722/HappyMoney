import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateNoticeDto {
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
