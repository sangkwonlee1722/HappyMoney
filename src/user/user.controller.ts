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
  Query
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, loginDto, updateUserDto } from "./dto/create-user.dto";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorator/public.decorator";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { compare, hash } from "bcrypt";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async updateUserInfo(@UserInfo() user: User, @Body() { nickName, phone, password }: updateUserDto) {
    const userInfo = await this.userService.findUserByEmail(user.email);

    const isPasswordValid = await compare(password, userInfo.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("비밀번호를 다시 입력해주세요.");
    }

    const hashedPassword = await hash(password, 10);

    await this.userService.updateUserInfo(user.id, nickName, phone, hashedPassword);
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
    await this.userService.deleteUser(user.id);
    return {
      success: true,
      message: "okay"
    };
  }
}
