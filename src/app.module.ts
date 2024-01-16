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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleAsyncOptions),
    PostModule,
    UserModule,
    AccountsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
