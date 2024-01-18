// /service/email.service.ts
import { createTransport, Transporter } from "nodemailer";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
// 메일 욥선 타입. 수신자(to), 메일 제목, html 형식의 메일 본문을 가짐
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  async generateEmailVerificationToken() {
    return uuidv4();
  }

  async verifyEmail(token: any) {
    try {
      const transporter = createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
          type: "OAuth2",
          user: this.configService.get<string>("GMAIL_OAUTH_USER"),
          clientId: this.configService.get<string>("GMAIL_OAUTH_CLIENT_ID"),
          clientSecret: this.configService.get<string>("GAMIL_OAUTH_CLIENT_SECRET"),
          refreshToken: this.configService.get<string>("GAMIL_OAUTH_REFRESH_TOKEN")
        }
      });

      const user = await this.userRepository.findOne({ where: { emailVerifyToken: token } });

      const emailVerifyToken = await this.generateEmailVerificationToken();
      const mailOptions = {
        to: user.email,
        subject: "[happymoney] 회원가입 이메일 인증 메일입니다.",
        html: `인증링크 : <a href="http://localhost:3000/api-docs/users/email-verify?token=${emailVerifyToken}">인증하기</a>`
      };

      await transporter.sendMail(mailOptions);

      console.log(user);
      if (!user) {
        throw new NotFoundException("User not found. Token is invalid or expired.");
      }

      user.isEmailVerified = true;
      user.emailVerifyToken = null;
      await this.userRepository.save(user);

      return { success: true, message: "Email verification successful." };
    } catch (error) {
      console.error(error);
      throw new NotFoundException("User not found. Token is invalid or expired.");
    }
  }
}
