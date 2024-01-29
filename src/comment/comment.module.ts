import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { Post } from "src/post/entities/post.entity";
import { PostModule } from "src/post/post.module";
import { PushModule } from "src/push/push.module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post]), PostModule, PushModule],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
