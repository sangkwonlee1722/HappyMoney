import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configModuleValidationSchema } from "./configs/env-validation.config";
import { typeOrmModuleAsyncOptions } from "./configs/database.config";
import { PostModule } from "./post/post.module";
import { AccountsModule } from "./accounts/accounts.module";
import { UserModule } from "./user/user.module";
import { StockModule } from "./stock/stock.module";
import { NoticeModule } from "./notice/notice.module";
import { CommentModule } from "./comment/comment.module";

import { AuthModule } from "./auth/auth.module";

import { ScheduleModule } from "@nestjs/schedule";
import { TwitModule } from './twit/twit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleAsyncOptions),
    PostModule,
    UserModule,
    AccountsModule,
    StockModule,
    NoticeModule,
    CommentModule,

    AuthModule,

    ScheduleModule.forRoot(),

    TwitModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
