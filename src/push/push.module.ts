import { Module } from "@nestjs/common";
import { PushService } from "./push.service";
import { PushController } from "./push.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Push } from "./entities/push.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Push])],
  controllers: [PushController],
  providers: [PushService]
})
export class PushModule {}
