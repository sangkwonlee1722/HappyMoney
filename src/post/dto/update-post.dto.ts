import { CreatePostDto } from "./create-post.dto";
import { PickType } from "@nestjs/swagger";

export class UpdatePostDto extends PickType(CreatePostDto, ["categoryId", "title", "contents"]) {}
