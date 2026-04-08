import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserReplicaModule } from 'src/modules/user-replica/user-replica.module';

@Module({
  imports: [
    UserReplicaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../../../.env'],
    }),
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
      name: 'content-service',
    }),
    BullModule.registerQueue({
      name: 'content-service-dlq',
    }),
  ],
  providers: [JobsService],
})
export class JobsModule {}
