import { Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { firstValueFrom } from "rxjs";
// import {
//   IAuthServiceGetAccessToken,
//   IAuthServiceSetRefreshToken,
// } from "./interfaces/auth-service.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
    // private http: HttpService
  ) {}

  // async OAuthLogin({ req, res }) {
  //   let user = await this.userService.findUserByEmail(req.email); //user를 찾아서
  //   console.log(user,);
  //   if (!user) {
  //     await this.userService.createUser(req.user);
  //   }

  //   this.setRefreshToken({ user, res });
  //   res.redirect("http://localhost:3000/api/oauth2/redirect/google");
  // }
  // setRefreshToken(arg0: { user: import("../user/entities/user.entity").User; res: any }) {
  //   throw new Error("Method not implemented.");
  // }

  async googleLogin(@Req() req: any) {
    if (!req.user) {
      console.log("ha");
      return "ha";
    }
    const { email } = req.user;

    const user = await this.userService.findUserByEmail(email); // 이메일로 가입된 회원을 찾고, 없다면 회원가입

    // JWT 토큰에 포함될 payload
    const payload = {
      id: user.id,
      email: user.email,
      nickName: user.nickName,
      name: user.name
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: "1d",
        secret: process.env.JWT_SECRET
      })
    };
  }

  // async kakaoLogin(apikey: string, redirectUri: string, code: string) {
  //   const config = {
  //     grant_type: "authorization_code",
  //     KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  //     redirect_uri: process.env.KAKAO_CODE_REDIRECT_URI,
  //     code
  //   };
  //   const params = new URLSearchParams(config).toString();
  //   const tokenHeaders = {
  //     "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
  //   };
  //   const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;

  //   const res = await firstValueFrom(this.http.post(tokenUrl, "", { headers: tokenHeaders }));
  //   console.log(res);
  // }
}
