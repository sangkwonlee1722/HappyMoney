// /service/email.service.ts
import { createTransport } from "nodemailer";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async verifyEmail(mailOptions) {
    try {
      // const OAuth2 = google.auth.OAuth2;
      // const oauth2Client = new OAuth2(
      //   process.env.GMAIL_OAUTH_CLIENT_ID,
      //   process.env.GAMIL_OAUTH_CLIENT_SECRET,
      //   "https://developers.google.com/oauthplayground"
      // );

      // oauth2Client.setCredentials({
      //   refresh_token: process.env.GAMIL_OAUTH_REFRESH_TOKEN
      // });

      // const { credentials } = await oauth2Client.refreshAccessToken();
      // let accessToken = credentials.access_token;

      // oauth2Client.refreshAccessToken().then((tokens) => (accessToken = tokens.credentials.access_token));

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
          // accessToken
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new NotFoundException("User not found. Token is invalid or expired.");
    }
  }
}
