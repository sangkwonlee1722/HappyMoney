import { PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Matches } from "class-validator";

// 회원가입
export class CreateUserDto {
  /**
   * 이메일
   * @example "test@test.com"
   * @requires true
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "비밀번호가 강력하지 않습니다." })
  password: string;

  /**
   * 확인 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "비밀번호가 강력하지 않습니다." })
  passwordCheck: string;

  /**
   * 이름
   * @example "김민재"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * 닉네임
   * @example "주식의왕"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  nickName: string;

  /**
   * 핸드폰 번호
   * @example "010-1111-1111"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  phone: string;
}

// 로그인
export class loginDto extends PickType(CreateUserDto, ["email", "password"] as const) {}
