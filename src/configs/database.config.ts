import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Notice } from "src/notice/entities/notice.entity";
import { Account } from "src/accounts/entities/account.entity";
import { Comment } from "src/comment/entities/comment.entity";
import { Post } from "src/post/entities/post.entity";
import { Stock } from "src/stock/entities/stock.entity";
import { Twit } from "src/twit/entities/twit.entity";
import { Push } from "src/push/entities/push.entity";
import { StarStock } from "src/star-stock/entities/star-stock.entity";
import { Order } from "src/order/entities/order.entity";
import { StockHolding } from "src/order/entities/stockHolding.entity";

export const typeOrmModuleAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: "mysql",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    username: configService.get<string>("DB_USERNAME"),
    password: configService.get<string>("DB_PASSWORD"),
    database: configService.get<string>("DB_NAME"),
    synchronize: configService.get<boolean>("DB_SYNC"),
    autoLoadEntities: true,
    entities: [User, Notice, Account, Comment, Post, Stock, Twit, Push, StarStock, Order, StockHolding],
    logging: false
  })
};
