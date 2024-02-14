import { Module } from "@nestjs/common";
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

import { TwitModule } from "./twit/twit.module";
import { PushModule } from "./push/push.module";
import { APP_FILTER } from "@nestjs/core";
import { SlackService } from "./common/slack/slack.service";
import { EmailModule } from "./email/email.module";
import { GlobalExceptionsFilter } from "./common/global-exceptions.filter";
import { NewsModule } from "./news/news.module";
import { StarStockModule } from "./star-stock/star-stock.module";
import { SearchModule } from "./search/search.module";
import { OrderModule } from "./order/order.module";

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
    EmailModule,
    TwitModule,
    OrderModule,
    PushModule,
    NewsModule,

    StarStockModule,
    OrderModule,
    SearchModule
  ],
  providers: [
    SlackService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter
    }
  ]
})
export class AppModule {}
