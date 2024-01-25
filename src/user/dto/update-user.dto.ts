import { PickType } from "@nestjs/swagger";
import { IsJSON, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { User } from "../entities/user.entity";

export class UpdateUserDto {
  // /**
  //  * 비밀번호
  //  * @example "Abcde123!"
  //  * @requires true
  //  */
  // @IsNotEmpty()
  // @IsString()
  // @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1, minUppercase: 0 })
  // password: string;

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

  // /**
  //  * 새로운 비밀번호
  //  * @example "Abcde123!"
  //  * @requires true
  //  */
  // @IsNotEmpty()
  // @IsString()
  // @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1, minUppercase: 0 })
  // newPassword: string;

  // /**
  //  * 새로운 확인 비밀번호
  //  * @example "Abcde123!"
  //  * @requires true
  //  */
  // @IsNotEmpty()
  // @IsString()
  // @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1, minUppercase: 0 })
  // newPasswordCheck: string;
}

export class PasswordCheck {
  @IsNotEmpty({ message: "현재 비밀번호를 입력해주세요." })
  password: string;
}

export class SubscriptionDto extends PickType(User, ["subscription"]) {}
