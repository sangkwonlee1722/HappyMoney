// jwt-social-google.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GMAIL_OAUTH_CLIENT_ID, //.env파일에 들어있음
      clientSecret: process.env.GAMIL_OAUTH_CLIENT_SECRET, //.env파일에 들어있음
      callbackURL: "http://localhost:3000/api/oauth2/redirect/google", //.env파일에 들어있음
      scope: ["email", "profile"]
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const { name, emails } = profile;
      console.log("🚀 🔶 GoogleStrategy 🔶 validate 🔶 profile:", profile);
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName
      };
      console.log("🚀 🔶 GoogleStrategy 🔶 validate 🔶 user:", user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
