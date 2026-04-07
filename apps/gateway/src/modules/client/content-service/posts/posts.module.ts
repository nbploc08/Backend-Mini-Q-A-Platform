import { Module } from '@nestjs/common';
import { PostsClientService } from './posts.service';
import { PostsClientController } from './posts.controller';
import { InternalJwtModule } from 'src/modules/internal-jwt/internal-jwt.module';

@Module({
  imports: [InternalJwtModule],
  controllers: [PostsClientController],
  providers: [PostsClientService],
  exports: [PostsClientService],
})
export class PostsClientModule {}
