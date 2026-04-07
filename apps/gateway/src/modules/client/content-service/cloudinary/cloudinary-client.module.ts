import { Module } from '@nestjs/common';
import { CloudinaryClientService } from './cloudinary-client.service';
import { CloudinaryClientController } from './cloudinary-client.controller';
import { InternalJwtModule } from 'src/modules/internal-jwt/internal-jwt.module';

@Module({
  imports: [InternalJwtModule],
  controllers: [CloudinaryClientController],
  providers: [CloudinaryClientService],
  exports: [CloudinaryClientService],
})
export class CloudinaryClientModule {}
