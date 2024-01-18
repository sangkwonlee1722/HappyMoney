import { Module, forwardRef } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";

@Module({
  controllers: [EmailController],
  providers: [EmailService, ConfigService],
  exports: [EmailService]
})
export class EmailModule {}
