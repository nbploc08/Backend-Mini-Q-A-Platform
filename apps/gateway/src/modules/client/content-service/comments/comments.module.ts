import { Module } from '@nestjs/common';
import { CommentsClientService } from './comments.service';
import { CommentsClientController } from './comments.controller';
import { InternalJwtModule } from 'src/modules/internal-jwt/internal-jwt.module';

@Module({
  imports: [InternalJwtModule],
  controllers: [CommentsClientController],
  providers: [CommentsClientService],
  exports: [CommentsClientService],
})
export class CommentsClientModule {}
