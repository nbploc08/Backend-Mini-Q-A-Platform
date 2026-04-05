import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpLoggerInterceptor, HttpExceptionFilter } from '@common/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  await app.listen(process.env.PORT ?? 8003);

  console.log(
    ` =======================-****** Content service listening on port ${process.env.PORT ?? 8003} =======================-****** `,
  );
}

bootstrap();
