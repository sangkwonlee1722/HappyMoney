import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { PushService } from "./push.service";
import { CreatePushDto } from "./dto/create-push.dto";
import { UpdatePushDto } from "./dto/update-push.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@ApiTags("push")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("push")
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  create(@Body() createPushDto: CreatePushDto) {
    return this.pushService.create(createPushDto);
  }

  @Get()
  async findAllMyPushNoti(@UserInfo() user: User) {
    const pushNotis = await this.pushService.findAllMyPushNoti(user.id);
    return {
      success: true,
      message: "okay",
      pushNotis
    };
  }

  @Get("VAPIDKeys")
  getVAPIDKeys() {
    const keys = {
      publicKey: this.configService.get<string>("VAPID_PUBLIC_KEY"),
      privateKey: this.configService.get<string>("VAPID_PRIVATE_KEY")
    };
    return keys;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatePushDto: UpdatePushDto) {
    return this.pushService.update(+id, updatePushDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pushService.remove(+id);
  }
}
