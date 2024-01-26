import { PickType } from "@nestjs/swagger";
import { Push } from "../entities/push.entity";

export class CreatePushDto extends PickType(Push, ["message"]) {}
