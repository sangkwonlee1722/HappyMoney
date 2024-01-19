// jwt-social-google.strategy.ts

import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

export class JwtGoogleStrategy extends PassportStrategy(Strategy, "google") {
  //UseGuards의 이름과 동일해야함
  constructor() {
    //constructor에서 성공하면 아래의 validate로 넘겨주고, 만약 실패하면 멈춰지고 에러 반환
    super({
      //자식의 constructor를 부모의 constructor에 넘기는 방법은 super를 사용하면 된다.
      clientID: process.env.GMAIL_OAUTH_CLIENT_ID, //.env파일에 들어있음
      clientSecret: process.env.GAMIL_OAUTH_CLIENT_SECRET, //.env파일에 들어있음
      callbackURL: "http://localhost:3000/api/oauth2/redirect/google", //.env파일에 들어있음
      scope: ["email"]
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    console.log("ha");
    try {
      const { name, emails, photos } = profile;
      console.log("🚀 🔶 GoogleStrategy 🔶 validate 🔶 profile:", profile);
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        photo: photos[0].value
      };
      console.log("🚀 🔶 GoogleStrategy 🔶 validate 🔶 user:", user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
