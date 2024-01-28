import { ConflictException, Injectable, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  async findByEmailOrSave(email: string, name: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) return user;

      const socialUser = this.userRepository.save({
        email,
        name: name,
        isEmailVerified: true
      });
      return socialUser;
    } catch (error) {
      throw new Error("사용자를 찾거나 생성하는데 실패하였습니다");
    }
  }

  async googleLogin(@Req() req: any) {
    const { email, name } = req.user;
    console.log(req.user.name);
    const member = await this.findByEmailOrSave(email, name); // 이메일로 가입된 회원을 찾고, 없다면 회원가입

    // JWT 토큰에 포함될 payload
    const payload = {
      id: member.id
    };
    const expiresIn = "1d"; // 하루 동안 유효한 토큰

    const token = this.jwtService.sign(payload, {
      expiresIn, // 정상적인 expiresIn 설정
      secret: process.env.JWT_SECRET
    });

    return token;
  }

  async kakaoLogin(@Req() req: any) {
    const { email, nickname } = req.user;
    console.log(req.user.nickname);
    const member = await this.findByEmailOrSave(email, nickname); // 이메일로 가입된 회원을 찾고, 없다면 회원가입

    const payload = {
      id: member.id
    };
    const expiresIn = "1d"; // 하루 동안 유효한 토큰

    const token = this.jwtService.sign(payload, {
      expiresIn, // 정상적인 expiresIn 설정
      secret: process.env.JWT_SECRET
    });

    return token;
  }

  async naverLogin(@Req() req: any) {
    let { email, name } = req.user;
    if (name === undefined) {
      name = "user";
    }
    const member = await this.findByEmailOrSave(email, name); // 이메일로 가입된 회원을 찾고, 없다면 회원가입

    // JWT 토큰에 포함될 payload
    const payload = {
      id: member.id
    };
    const expiresIn = "1d"; // 하루 동안 유효한 토큰

    const token = this.jwtService.sign(payload, {
      expiresIn, // 정상적인 expiresIn 설정
      secret: process.env.JWT_SECRET
    });

    return token;
  }
}
