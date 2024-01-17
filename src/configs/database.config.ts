import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";

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
    entities: [User], // 엔티티에 넣어야된다.모듈대신
    logging: true
  })
};
