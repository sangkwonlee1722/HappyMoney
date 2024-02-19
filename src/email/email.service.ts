import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

// 이메일 전송 함수
@Injectable()
export class EmailService {
  private transporter;
  constructor(private configService: ConfigService) {}

  async verifyEmail(mailOptions) {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get("NODE_MAIL_ID"), // 이메일을 전송할 구글 이메일
          pass: this.configService.get("NODE_MAIL_PW") // 해당 이메일의 앱 비밀번호 (설정링크: https://humorrow.org/14)
        }
      });

      this.transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "okay"
      };
    } catch (error) {
      console.error(error);
      throw new NotFoundException("User not found. Token is invalid or expired.");
    }
  }
}
