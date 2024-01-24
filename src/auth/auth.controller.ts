import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";

interface IOAuthUser {
  //interface 설정
  user: {
    name: string;
    email: string;
    password: string;
  };
}

@ApiTags("social login")
@Controller() //컨트롤러 데코레이터
export class AuthController {
  //클래스이름
  constructor(
    //컨스트럭터로 초기값설정
    private readonly userService: UserService, //DI 해주기
    private readonly authService: AuthService
  ) {}

  /**
   * 구글 로그인
   * @returns
   */

  @Post("google/login") // 구글 로그인으로 이동하는 라우터 메서드
  @UseGuards(AuthGuard("google")) // 여기에서 가드로 가고 googleStrategy에서 validate호출
  async googleAuth(@Req() req: any) {
    console.log("GET google/login - googleAuth 실행");
    await this.authService.googleLogin(req.email);
  }

  @Get("oauth2/redirect/google")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    console.log("GET oauth2/redirect/google - googleAuthRedirect 실행");

    const { user } = req;
    return res.send(user); // 화면에 표시.
  }

  /**
   * 네이버 로그인
   * @returns
   */

  @Get("login/naver")
  @UseGuards(AuthGuard("naver"))
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {
    this.authService.OAuthLogin({ req, res });
  }
}
