import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Post #1 (đã cập nhật)', description: 'Tiêu đề bài viết', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Nội dung đã cập nhật cho post #1.', description: 'Nội dung bài viết', maxLength: 50000 })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;
}
