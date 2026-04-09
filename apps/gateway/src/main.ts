import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpLoggerInterceptor, HttpExceptionFilter, TransformInterceptor } from '@common/core';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // Serve static files from public/
    app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  // Standardize success response
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mini Q&A Platform API')
    .setDescription('API Gateway documentation cho Mini Q&A Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  console.log(
    ` =======================-****** Gateway listening on port  ${port} =======================-******`,
  );
  console.log(
    ` 📄 Swagger API Docs: http://localhost:${port}/api-docs`,
  );
}
bootstrap();
