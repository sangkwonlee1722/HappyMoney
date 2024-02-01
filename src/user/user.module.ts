import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "src/auth/jwt.strategy";
import { EmailModule } from "src/email/email.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    AuthModule,
    PassportModule,
    EmailModule,
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
  controllers: [UserController],
  providers: [JwtStrategy, UserService],
  exports: [UserService]
})
export class UserModule {}
