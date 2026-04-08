import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ example: 'Làm sao để sử dụng NestJS với Prisma?', description: 'Tiêu đề câu hỏi', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Mình đang tìm hiểu cách tích hợp...', description: 'Nội dung câu hỏi', maxLength: 50000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;
}
