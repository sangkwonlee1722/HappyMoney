// import { PassportStrategy } from "@nestjs/passport";
// import { Profile, Strategy } from "passport-kakao";

// const passport = require('passport')
// const KakaoStrategy = require('passport-kakao').Strategy

// passport.use(new KakaoStrategy({
//     clientID : process.env.kakaoClientID,
//     clientSecret: process.env.kakaoClientSecret, // clientSecret을 사용하지 않는다면 넘기지 말거나 빈 스트링을 넘길 것
//     callbackURL : process.env.kakaoCallbackURL
//   },
//   (accessToken, refreshToken, profile, done) => {
//     // 사용자의 정보는 profile에 들어있다.
//     User.findOrCreate(..., (err, user) => {
//       if (err) { return done(err) }
//       return done(null, user)
//     })
//   }
// ))
