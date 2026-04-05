import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserReplicaModule } from '../user-replica/user-replica.module';

@Module({
  imports: [UserReplicaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
