import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EmailService } from "./email.service";

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" }
      })
    })
  ],
  controllers: [EmailController],
  providers: [EmailService, ConfigService],
  exports: [EmailService]
})
export class EmailModule {}
