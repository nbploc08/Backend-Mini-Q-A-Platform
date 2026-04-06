import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  NatsModule,
  PermissionGuard,
  PermissionModule,
  RateLimiterGuard,
  RateLimiterModule,
  RequestIdMiddleware,
} from '@common/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from './modules/jwt/jwt.module';
import { CombinedJwtAuthGuard } from './modules/jwt/strategy/jwt-auth.guard';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PostsModule } from './modules/posts/posts.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    NatsModule.forRoot({
      serviceName: 'content-service',
      streams: [{ name: 'CONTENT_EVENT', subjects: ['content.*'] }],
    }),
    JwtModule,
    PrismaModule,
    JobsModule,
    PostsModule,
    QuestionsModule,
    CommentsModule,
    PermissionModule,
    RateLimiterModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CombinedJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
