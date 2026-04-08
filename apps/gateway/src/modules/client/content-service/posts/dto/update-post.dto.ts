import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Tiêu đề đã cập nhật', description: 'Tiêu đề bài viết', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Nội dung đã cập nhật', description: 'Nội dung bài viết', maxLength: 50000 })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;
}
