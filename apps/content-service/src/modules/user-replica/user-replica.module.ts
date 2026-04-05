import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { UserReplicaService } from './user-replica.service';

@Module({
  imports: [PrismaModule],
  providers: [UserReplicaService],
  exports: [UserReplicaService],
})
export class UserReplicaModule {}
