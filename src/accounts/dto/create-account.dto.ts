import { PickType } from "@nestjs/swagger";
import { Account } from "../entities/account.entity";

export class CreateAccountDto extends PickType(Account, ["name"]) {}
