import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const app2 = await NestFactory.create(AppModule, { cors: true });

  const corsOptions: CorsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Authorization", "Content-Type"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
  };

  app2.enableCors(corsOptions);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT");

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("HappyMoney")
    .setDescription("Node.js 3기 최종프로젝트 happymoney api")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagSorter: "alpha",
      operationSorter: "alpha"
    }
  });

  // 정적 파일 제공
  app.useStaticAssets(join(__dirname, "..", "assets"));

  await app.listen(port);
}

bootstrap();
