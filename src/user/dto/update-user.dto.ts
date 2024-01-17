import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class UpdateUserDto {
  /**
   * 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  password: string;

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

  /**
   * 새로운 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  newPassword: string;

  /**
   * 새로운 확인 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  newPasswordCheck: string;
}
