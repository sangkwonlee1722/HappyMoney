import { PickType } from "@nestjs/swagger";
import { News } from "../entities/news.entity";

export class CreateNewsDto extends PickType(News, ["newspaper", "title", "link"]) {}
