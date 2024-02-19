import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";

interface IOAuthUser {
  user: {
    name: string;
    email: string;
    password: string;
  };
}
@ApiTags("Auth")
@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService
  ) {}

  //-----------------------구글 로그인-----------------------------//

  /**
   * 구글 소셜 로그인
   * @returns
   */
  @Get("google/login")
  @UseGuards(AuthGuard("google"))
  async loginGoogle(@Req() req: Request & IOAuthUser, @Res() res: Response) {}
  // 정상적으로 로그인이 되면 COOKIE에 TOKEN을 저장하며 로그인을 하게된다.
  /**
   * 구글 로그인 리다이렉트 URI
   * @returns
   */
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const token = await this.authService.socialLogin(req);
    res.cookie("accessToken", token);
    return res.redirect("/views/main.html");
  }

  //-----------------------카카오 로그인-----------------------------//
  /**
   * 카카오 소셜 로그인
   * @returns
   */
  @Get("kakao/login")
  @UseGuards(AuthGuard("kakao"))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {}
  // 정상적으로 로그인이 되면 COOKIE에 TOKEN을 저장하며 로그인을 하게된다.
  /**
   * 카카오 로그인 리다이렉트 URI
   * @returns
   */
  @Get("kakao/callback")
  @UseGuards(AuthGuard("kakao"))
  async kakaoLoginCallback(@Req() req: any, @Res() res: any) {
    const token = await this.authService.socialLogin(req);
    res.cookie("accessToken", token);
    return res.redirect("/views/main.html");
  }

  //-----------------------네이버 로그인-----------------------------//
  /**
   * 네이버 소셜 로그인
   * @returns
   */
  @Get("naver/login")
  @UseGuards(AuthGuard("naver"))
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response
  ) {}
  // 정상적으로 로그인이 되면 COOKIE에 TOKEN을 저장하며 로그인을 하게된다.
  /**
   * 네이버 로그인 리다이렉트 URI
   * @returns
   */
  @Get("naver/callback")
  @UseGuards(AuthGuard("naver"))
  async naverLoginCallback(@Req() req: any, @Res() res: any) {
    const token = await this.authService.socialLogin(req);
    res.cookie("accessToken", token);
    return res.redirect("/views/main.html");
  }

  /**
   * 서버 health 체크
   * @returns
   */
  @Get("health")
  async healthCheck() {
    return {
      success: true,
      message: "okay"
    };
  }
}
