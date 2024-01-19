import { Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
// import {
//   IAuthServiceGetAccessToken,
//   IAuthServiceSetRefreshToken,
// } from "./interfaces/auth-service.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  async OAuthLogin({ req, res }) {
    console.log(req, res, "haha");
    // 1. 회원조회
    let user = await this.userService.findUserByEmail(req.email); //user를 찾아서

    // 2, 회원가입이 안되어있다면? 자동회원가입
    if (!user) {
      await this.userService.createUser(req.user);
    } //user가 없으면 하나 만들고, 있으면 이 if문에 들어오지 않을거기때문에 이러나 저러나 user는 존재하는게 됨.

    // 3. 회원가입이 되어있다면? 로그인(AT, RT를 생성해서 브라우저에 전송)한다
    this.setRefreshToken({ user, res });
    res.redirect("리다이렉트할 url주소");
  }
  setRefreshToken(arg0: { user: import("../user/entities/user.entity").User; res: any }) {
    throw new Error("Method not implemented.");
  }

  async googleLogin(@Req() req: any) {
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
}
