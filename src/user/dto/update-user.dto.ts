import { PickType } from "@nestjs/swagger";
import { IsJSON, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { User } from "../entities/user.entity";

export class UpdateUserDto {
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

export class PasswordCheck {
  @IsNotEmpty({ message: "현재 비밀번호를 입력해주세요." })
  password: string;
}

export class SubscriptionDto extends PickType(User, ["subscription"]) {}
