import { PickType } from "@nestjs/swagger";
import { CreateAccountDto } from "./create-account.dto";

export class UpdateAccountDto extends PickType(CreateAccountDto, ["name"]) {}
