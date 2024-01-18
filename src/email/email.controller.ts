import { Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("users")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get("email-verify")
  async verifyEmail(@Query("token") token: any) {
    console.log("haha");
    const result = await this.emailService.verifyEmail(token);
    console.log("haha");
    console.log(result, "co");
    if (result.success) {
      return { success: true, message: "okay" };
    } else {
      throw new NotFoundException("Email verification failed. Token is invalid or expired.");
    }
  }
}
