import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

export class JwtGoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly userRepository: Repository<User>) {
    super({
      clientID: process.env.GMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.GAMIL_OAUTH_CLIENT_SECRET,
      callbackURL: "https://happymoneynow.com/api/google/callback",
      scope: ["email", "profile"]
    });
  }

  async validate(accessToken, refreshToken, profile) {
    const signupType = profile.provider;
    return {
      name: profile.displayName,
      email: profile.emails[0].value,
      hashedPassword: "1234",
      signupType,
      profile
    };
  }
}
