// social-kakao-strategy.ts

import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";

export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: "/api/kakao/callback",
      scope: ["account_email", "profile_nickname"]
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // console.log("accessToken: ", accessToken);
    // console.log("refreshToken: ", refreshToken);
    // console.log(profile);
    const signupType = profile.provider;

    return {
      email: profile._json.kakao_account.email,
      password: String(profile.id),
      nickname: profile.displayName,
      signupType,
      profile
    };
  }
}
