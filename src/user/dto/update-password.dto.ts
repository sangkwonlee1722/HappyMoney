import { PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class UpdatePasswordDto {
  /**
   * 새로운 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty({ message: "비밀번호를 작성해주세요." })
  @IsString()
  @IsStrongPassword(
    { minLength: 6, minNumbers: 1, minSymbols: 1, minUppercase: 0 },
    { message: "특수문자를 포함해야합니다." }
  )
  newPassword: string;

  /**
   * 새로운 확인 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty({ message: "비밀번호를 작성해주세요." })
  @IsString()
  @IsStrongPassword(
    { minLength: 6, minNumbers: 1, minSymbols: 1, minUppercase: 0 },
    { message: "특수문자를 포함해야합니다." }
  )
  newPasswordCheck: string;
}
