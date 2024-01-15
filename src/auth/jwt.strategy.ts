import _ from "lodash";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET")
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findUserById(payload.sub);
    return user;
  }
}
