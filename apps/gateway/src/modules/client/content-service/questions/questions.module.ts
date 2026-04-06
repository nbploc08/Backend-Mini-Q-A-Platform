import { Module } from '@nestjs/common';
import { QuestionsClientService } from './questions.service';
import { QuestionsClientController } from './questions.controller';
import { InternalJwtModule } from 'src/modules/internal-jwt/internal-jwt.module';

@Module({
  imports: [InternalJwtModule],
  controllers: [QuestionsClientController],
  providers: [QuestionsClientService],
  exports: [QuestionsClientService],
})
export class QuestionsClientModule {}
