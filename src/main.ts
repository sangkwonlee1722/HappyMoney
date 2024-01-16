import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import express, { Express, RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get<number>("SERVER_PORT");
  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
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

  // CORS 설정 및 프록시 설정
  const corsProxy: Express = express();
  const proxyHandler: RequestHandler = createProxyMiddleware({
    target: "https://openapi.koreainvestment.com:9443",
    changeOrigin: true,
    secure: false,
    pathRewrite: { "^/": "/" },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"; // 또는 실제 프론트엔드 호스트 주소
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    }
  });

  corsProxy.use("/", proxyHandler);

  const nestApp = app.getHttpAdapter().getInstance();
  const proxyServer = corsProxy.listen(8080, () => {
    console.log("CORS Proxy Server is running on http://localhost:8080");
  });

  // 정적 파일 제공
  app.useStaticAssets(join(__dirname, "..", "assets"));

  await app.listen(port);

  // 애플리케이션 종료 이벤트 대신 프록시 서버 종료를 기다림
  process.on("SIGINT", () => {
    proxyServer.close();
    process.exit();
  });
}

bootstrap();
