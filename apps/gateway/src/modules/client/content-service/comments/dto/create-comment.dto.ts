import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Bình luận cho post 1 (#101)', description: 'Nội dung comment', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional({ example: 1, description: 'ID của bài viết (nếu comment cho post)' })
  @IsOptional()
  @IsInt()
  postId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID của câu hỏi (nếu comment cho question)' })
  @IsOptional()
  @IsInt()
  questionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID comment cha (để reply)' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID comment được reply trực tiếp' })
  @IsOptional()
  @IsInt()
  replyToId?: number;
}
