import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notice } from "src/notice/entities/notice.entity";
import { Post } from "src/post/entities/post.entity";
import { Stock } from "src/stock/entities/stock.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Notice, Post, Stock])],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
