import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { MailsModule } from 'src/modules/mails/mails.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../../../.env'],
    }),
    MailsModule,
    NotificationModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<BullRootModuleOptions> => ({
        connection: {
          url: configService.get<string>('REDIS_URL') || '',
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'notification-service',
    }),
    BullModule.registerQueue({
      name: 'notification-service-dlq',
    }),
  ],
  providers: [JobsService],
})
export class JobsModule {}
