import { ConflictException, Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { socialLoginDto } from "./dto/social-dto";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async OAuthLogin({ req, res }) {
    let user = await this.userService.findUserByEmail(req.email);

    if (!user) {
      await this.userService.createUser(req.user);
    }

    this.setRefreshToken({ user, res });
    res.redirect("리다이렉트할 url주소");
  }

  setRefreshToken(arg0: { user: import("../user/entities/user.entity").User; res: any }) {
    throw new Error("Method not implemented.");
  }

  async googleLogin(@Req() req: any) {
    const { email } = req.user;
    const name = req.user.firstName + req.user.lastName;
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      throw new ConflictException("이미 존재하는 회원입니다.");
    }

    console.log(user);
    console.log(req.user);
    console.log(name);

    const payload = {
      name: name
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: "1d",
        secret: process.env.JWT_SECRET
      })
    };
  }

  async kakaoLogin(apikey: string, redirectUri: string, code: string) {
    const config = {
      grant_type: "authorization_code",
      KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_CODE_REDIRECT_URI,
      code
    };
    const params = new URLSearchParams(config).toString();
    const tokenHeaders = {
      "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
    };
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;

    // const res = await firstValueFrom(this.http.post(tokenUrl, "", { headers: tokenHeaders }));
    // console.log(res);
  }
}
