import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { UserReplicaService } from './user-replica.service';

@Module({
  imports: [QueueModule],
  providers: [UserReplicaService],
  exports: [UserReplicaService],
})
export class UserReplicaModule {}
