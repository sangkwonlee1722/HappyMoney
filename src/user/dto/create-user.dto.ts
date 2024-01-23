import { PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Matches } from "class-validator";
import { isString } from "lodash";

//엔티티에서 유효성처리
// 회원가입
export class CreateUserDto {
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

  @IsString()
  @IsStrongPassword(
    { minLength: 8, minNumbers: 1, minSymbols: 1, minUppercase: 0 },
    { message: "비밀번호는 특수문자를 포함해야 합니다." }
  )
  @IsNotEmpty({ message: "비밀번호를 작성해주세요." })
  password: string;

  /**
   * 확인 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsString()
  @IsStrongPassword(
    { minLength: 8, minNumbers: 1, minSymbols: 1, minUppercase: 0 },
    { message: "비밀번호는 특수문자를 포함해야 합니다." }
  )
  @IsNotEmpty({ message: "비밀번호를 작성해주세요." })
  passwordCheck: string;

  /**
   * 이름
   * @example "김민재"
   * @requires true
   */
  @IsNotEmpty({ message: "이름을 작성해주세요." })
  @IsString()
  name: string;

  /**
   * 닉네임
   * @example "주식의왕"
   * @requires true
   */
  @IsNotEmpty({ message: "닉네임을 작성해주세요." })
  @IsString()
  nickName: string;

  /**
   * 핸드폰 번호
   * @example "010-1111-1111"
   * @requires true
   */
  @IsNotEmpty({ message: "휴대폰 번호를 작성해주세요." })
  @IsString()
  phone: string;
}

// 로그인
export class loginDto extends PickType(CreateUserDto, ["email", "password"] as const) {}
