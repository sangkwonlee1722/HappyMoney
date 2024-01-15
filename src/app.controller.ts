import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller({ path: "", host: "api" })
export class AppController {
  constructor(private readonly appService: AppService) {}
}
