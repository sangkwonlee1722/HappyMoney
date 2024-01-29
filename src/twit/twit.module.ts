import { Module } from "@nestjs/common";
import { TwitService } from "./twit.service";
import { TwitController } from "./twit.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Twit } from "./entities/twit.entity";
import { User } from "src/user/entities/user.entity";
import { UserModule } from "src/user/user.module";
import { PushModule } from "src/push/push.module";

@Module({
  imports: [TypeOrmModule.forFeature([Twit]), UserModule, PushModule],
  controllers: [TwitController],
  providers: [TwitService]
})
export class TwitModule {}
