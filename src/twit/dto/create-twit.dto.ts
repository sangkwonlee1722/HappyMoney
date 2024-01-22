import { PickType } from "@nestjs/swagger";
import { Twit } from "../entities/twit.entity";
import { IsString } from "class-validator";

export class CreateTwitDto extends PickType(Twit, ["contents"]) {
  /**
   * 받는사람 닉네임
   * @example "주식왕"
   * @requires true
   */
  @IsString()
  receiveNickname: string;
}
