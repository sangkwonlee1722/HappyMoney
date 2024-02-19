import { Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  // 소셜로그인으로 가입 시 DB에 저장
  async findByEmailOrSave(email: string, name: string, signupType: string, nickName: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) return user;

      const socialUser = this.userRepository.save({
        email,
        name,
        signupType,
        nickName,
        isEmailVerified: true
      });
      return socialUser;
    } catch (error) {
      throw new Error("사용자를 찾거나 생성하는데 실패하였습니다");
    }
  }

  // 소셜 로그인 랜덤 닉네임
  async generateUniqueRandomNickname() {
    let isUnique = false;
    let nickname = "";

    while (!isUnique) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);

      nickname = `G${randomDigits}`;

      const existingUser = await this.userService.findUserByNickName(nickname);
      isUnique = !existingUser;
    }

    return nickname;
  }

  // 소셜 로그인으로 가입 시 회원정보
  async socialLogin(@Req() req: any) {
    let { email, name, signupType } = req.user;
    const nickname = await this.generateUniqueRandomNickname();

    if (!name && !req.user.nickname) {
      name = "SocialUser";
    } else if (!name) {
      name = req.user.nickname;
    }

    const user = await this.findByEmailOrSave(email, name, signupType, nickname);

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      signupType: user.signupType
    };

    const expiresIn = "1d";

    const token = this.jwtService.sign(payload, {
      expiresIn,
      secret: process.env.JWT_SECRET
    });

    return token;
  }
}
