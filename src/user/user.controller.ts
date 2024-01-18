import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
  Query,
  NotFoundException,
  Res,
  Req
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, loginDto } from "./dto/create-user.dto";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorator/public.decorator";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { compare, hash } from "bcrypt";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 이메일 회원가입 인증
   * @returns
   */
  @Public()
  @Get("email-verify-signin")
  async verifyEmailSignin() {
    const allUser = await this.userService.find();

    const user = allUser.filter((user) => {
      return user.emailVerifyToken !== null && user.isEmailVerified !== true;
    });

    const userVerify = user[0];

    if (!userVerify) {
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    await this.userService.updateUserVerify(userVerify.id, {
      isEmailVerified: true,
      emailVerifyToken: null
    });
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password, passwordCheck } = createUserDto;
    if (password !== passwordCheck) throw new BadRequestException("비밀번호를 확인해주세요.");
    await this.userService.createUser(createUserDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 로그인
   * @param loginDto
   * @returns
   */
  @Public()
  @Post("login")
  async login(@Body() loginDto: loginDto) {
    const { email, password } = loginDto;

    return this.userService.login(email, password);
  }

  /**
   * 로그아웃
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  logout(@Req() req: any, @Res() res: any) {
    req.logout();
    console.log(req.logout());
    res.clearCookie("connect.sid", { httpOnly: true });
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 내 정보 조회
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("mypage")
  async getUserInfo(@UserInfo() user: User) {
    return user;
  }

  /**
   * 내 정보 수정
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("mypage")
  async updateUserInfo(@UserInfo() user: User, @Body() updateUserDto: UpdateUserDto) {
    const { nickName, phone, password, newPassword, newPasswordCheck } = updateUserDto;
    const userInfo = await this.userService.findUserByEmail(user.email);
    const allUser = await this.userService.find();

    allUser.forEach((user) => {
      if (user.nickName === nickName) {
        throw new UnauthorizedException("이미 존재하는 닉네임입니다.");
      }
    });

    const isPasswordValid = await compare(password, userInfo.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("비밀번호를 다시 입력해주세요.");
    }

    if (newPassword && newPassword !== newPasswordCheck) {
      throw new UnauthorizedException("새로운 비밀번호를 확인해주세요.");
    }

    const hashedPassword = await hash(String(newPassword), 10);

    await this.userService.updateUserInfo(user.id, nickName, phone, hashedPassword);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 이메일 회원탈퇴 인증
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("email-verify-signout")
  async verifyEmailSignout(@UserInfo() user: User) {
    await this.userService.deleteUser(user.id);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 회원탈퇴
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete("delete")
  async deleteUser(@UserInfo() user: User) {
    await this.userService.deleteUserSendEmail(user.id);
    return {
      success: true,
      message: "okay"
    };
  }
}
