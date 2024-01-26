import { PartialType, PickType } from "@nestjs/swagger";
import { CreatePushDto } from "./create-push.dto";
import { Push } from "../entities/push.entity";

export class UpdatePushDto extends PickType(Push, ["isRead"]) {}
