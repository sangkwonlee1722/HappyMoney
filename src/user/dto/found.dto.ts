import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class foundPasswordDto {
  /**
   * 이메일
   * @example "test@test.com"
   * @requires true
   */
  @IsEmail({}, { message: "이메일 형식으로 작성해주세요." })
  email: string;
}

export class foundEmaildDto {
  /**
   * 핸드폰 번호
   * @example "010-1111-1111"
   * @requires true
   */
  @IsString()
  phone: string;
}
