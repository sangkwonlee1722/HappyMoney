import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

// 회원가입
export class CreateUserDto {
  @ApiProperty({ required: true, example: "test@test.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, example: "123456" })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({ required: true, example: "123456" })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  passwordCheck: string;

  @ApiProperty({ required: true, example: "김민재" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: "주식의왕" })
  @IsString()
  @IsNotEmpty()
  nick_name: string;

  @ApiProperty({ required: true, example: "010-1234-1111" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "user" })
  @IsString()
  @IsOptional()
  signup_type: string;
}

// // 로그인
// export class ReqLoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}

// //  유저 정보 수정
// export class ReqUpdateUserDto extends PickType(CreateUserDto, ['name'] as const) {}
