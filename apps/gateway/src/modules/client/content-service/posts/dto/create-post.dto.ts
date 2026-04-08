import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Hướng dẫn NestJS cơ bản', description: 'Tiêu đề bài viết', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết chi tiết...', description: 'Nội dung bài viết', maxLength: 50000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;
}
