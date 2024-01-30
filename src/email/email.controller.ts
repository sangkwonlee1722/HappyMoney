import { Controller, Get, NotFoundException, Query } from "@nestjs/common";

@Controller("users")
export class EmailController {
  constructor() {}
  @Get("email-verify")
  async verifyEmail(@Query("token") token: any) {}
}
