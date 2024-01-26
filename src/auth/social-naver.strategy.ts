// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy } from "passport-naver";

// export class JwtNaverStrategy extends PassportStrategy(Strategy, "naver") {
//   constructor(private readonly configService: ConfigService) {
//     super({
//       authorizationURL: "https://nid.naver.com/oauth2.0/authorize",
//       tokenURL: "https://nid.naver.com/oauth2.0/token",
//       clientID: process.env.NAVER_CLIENT_ID,
//       clientSecret: process.env.NAVER_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000", // Replace with your actual callback URL
//       passReqToCallback: true
//     });
//   }

//   validate(accessToken: string, refreshToken: string, profile: any) {
//     console.log(accessToken);
//     console.log(refreshToken);
//     console.log(profile);

//     return {
//       name: profile.displayName,
//       email: profile._json.email,
//       password: profile.id
//     };
//   }
// }
