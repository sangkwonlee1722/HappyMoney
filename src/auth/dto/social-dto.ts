import { PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Matches } from "class-validator";
import { isString } from "lodash";

//엔티티에서 유효성처리
// 회원가입
export class socialLoginDto {
  /**
   * 이메일
   * @example "test@test.com"
   * @requires true
   */
  @IsEmail({}, { message: "이메일 형식으로 작성해주세요." })
  @IsNotEmpty({ message: "이메일을 작성해주세요." })
  email: string;
  /**
   * 비밀번호
   * @example "Abcde123!"
   * @requires true
   */

  /**
   * 이름
   * @example "김민재"
   * @requires true
   */
  @IsNotEmpty({ message: "이름을 작성해주세요." })
  @IsString()
  name: string;
}
