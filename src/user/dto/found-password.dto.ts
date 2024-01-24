import { IsEmail, IsNotEmpty } from "class-validator";

export class foundPasswordDto {
  /**
   * 이메일
   * @example "test@test.com"
   * @requires true
   */
  @IsEmail({}, { message: "이메일 형식으로 작성해주세요." })
  @IsNotEmpty({ message: "이메일을 작성해주세요." })
  email: string;
}
