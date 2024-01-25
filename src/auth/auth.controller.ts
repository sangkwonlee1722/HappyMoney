import { Controller, Get, Header, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
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

  @Get("google/login") // 구글 로그인으로 이동하는 라우터 메서드
  @UseGuards(AuthGuard("google")) // 여기에서 가드로 가고 googleStrategy에서 validate호출
  async googleAuth(@Req() req: any) {
    await this.authService.googleLogin(req.email);
  }

  @Get("oauth2/redirect/google")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const jwt = await this.authService.googleLogin(req);

    const { user } = req;
    return res.send({ user, jwt }); // 화면에 표시.
  }

  // @Get("kakao-login-page")
  // @Header("Content-Type", "text/html")
  // async kakaoRedirect(@Res() res: Response): Promise<void> {
  //   const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_CODE_REDIRECT_URI}`;
  //   res.redirect(url);
  // }

  // @Get("kakao")
  // @UseGuards(AuthGuard("kakao"))
  // async getKakaoInfo(@Query() query: { code }) {
  //   const cliendid = process.env.KAKAO_CLIENT_ID;
  //   const redirectUri = process.env.KAKAO_CODE_REDIRECT_URI;
  //   await this.authService.kakaoLogin(cliendid, redirectUri, query.code);
  // }

  /**
   * 네이버 로그인
   * @returns
   */

  // @Get("login/naver")
  // @UseGuards(AuthGuard("naver"))
  // async loginNaver(
  //   @Req() req: Request & IOAuthUser, //
  //   @Res() res: Response
  // ) {
  //   this.authService.OAuthLogin({ req, res });
  // }
}
