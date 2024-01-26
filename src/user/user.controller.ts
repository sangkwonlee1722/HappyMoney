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
  Req,
  HttpStatus
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, loginDto } from "./dto/create-user.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "./entities/user.entity";
// import { JwtAuthGuard } from "src/auth/jwt.auth.guard";
import { compare, hash } from "bcrypt";
import { PasswordCheck, SubscriptionDto, UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { foundPasswordDto, foundEmaildDto } from "./dto/found.dto";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 이메일 회원가입 인증
   * @returns
   */
  @Get("email-verify-signin")
  async verifyEmailSignin(@Query("email") email: string, @Res() res: any) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    await this.userService.updateUserVerify(user.id, {
      isEmailVerified: true
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

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password, passwordCheck } = createUserDto;
    if (password !== passwordCheck) throw new BadRequestException("비밀번호를 확인해주세요.");

    try {
      await this.userService.createUser(createUserDto);
      return {
        success: true,
        message: "okay"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response.message
      };
    }
  }

  /**
   * 로그인
   * @param loginDto
   * @returns
   */

  @Post("login")
  async login(@Body() loginDto: loginDto) {
    const { email, password } = loginDto;

    return this.userService.login(email, password);
  }

  /**
   * 로그아웃
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post("logout")
  logout(@Req() req: any, @Res() res: any) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    req.logOut();
    // 로그아웃 풀기
    res.clearCookie("connect.sid", { httpOnly: true });
    res.clearCookie(token);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 내 정보 조회
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Get("mypage")
  async getUserInfo(@UserInfo() user: User) {
    return user;
  }

  /**
   * 내 정보 수정
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Patch("mypage")
  async updateUserInfo(@UserInfo() user: User, @Body() updateUserDto: UpdateUserDto) {
    const { nickName, phone } = updateUserDto;

    const allUser = await this.userService.find();

    allUser.forEach((users) => {
      if (users.nickName === nickName && users.id !== user.id) {
        throw new UnauthorizedException("이미 존재하는 닉네임입니다.");
      }
    });

    await this.userService.updateUserInfo(user.id, nickName, phone);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 내 정보 수정 시 비밀번호 체크
   * @param user
   * @param param1
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post("check-password")
  async checkPassword(@UserInfo() user: User, @Body() { password }: PasswordCheck) {
    const userInfo = await this.userService.findUserByEmail(user.email);
    const isPasswordValid = await compare(password, userInfo.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("비밀번호를 다시 입력해주세요.");
    }

    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 내 비밀번호 수정
   * @param user
   * @param param1
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Patch("update-password")
  async updatePassword(@UserInfo() user: User, @Body() updatePasswordDto: UpdatePasswordDto) {
    const { newPassword, newPasswordCheck } = updatePasswordDto;
    if (newPassword && newPassword !== newPasswordCheck) {
      throw new UnauthorizedException("새로운 비밀번호를 확인해주세요.");
    }

    const hashedPassword = await hash(String(newPassword), 10);

    await this.userService.updatePassword(user.id, hashedPassword);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 이메일 회원탈퇴 인증
   * @returns
   */
  @Get("email-verify-signout")
  async verifyEmailSignout(@Query("email") email: string) {
    const user = await this.userService.findUserByEmail(email);
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
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Delete("delete")
  async deleteUser(@UserInfo() user: User) {
    await this.userService.deleteUserSendEmail(user.id);
    return {
      user,
      success: true,
      message: "okay"
    };
  }

  /**
   * 전체 유저 조회
   * @returns
   */

  @Get()
  async getUser() {
    const users = await this.userService.find();
    return {
      data: { users },
      success: true,
      message: "okay"
    };
  }

  /**
   * 구독 정보 저장
   * @param param0
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Patch("subscription")
  async saveSubscription(@Body() { subscription }: SubscriptionDto, @UserInfo() user: User) {
    const existUser = await this.userService.findUserById(user.id);
    if (!existUser) {
      throw new NotFoundException({ success: false, message: "해당하는 유저를 찾을 수 없습니다." });
    }

    await this.userService.saveSubscription(subscription, user.id);
    return {
      success: true,
      message: "okay"
    };
  }
  /**
   * 비밀번호 찾기
   * @returns
   */
  @Post("found-password")
  async foundPassword(@Body() foundPasswordDto: foundPasswordDto) {
    const { email } = foundPasswordDto;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException("회원이 아닙니다.");
    }

    try {
      await this.userService.sendTemporaryPassword(email);
      return {
        success: true,
        message: "okay"
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.response
      };
    }
  }

  /**
   * 이메일 찾기
   * @returns
   */
  @Post("found-email")
  async foundEmail(@Body() foundEmaildDto: foundEmaildDto) {
    const { phone } = foundEmaildDto;
    const user = await this.userService.findUserByPhone(phone);

    if (!user) {
      throw new NotFoundException("회원이 아닙니다.");
    }

    try {
      return {
        user,
        success: true,
        message: "okay"
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.response
      };
    }
  }
}
