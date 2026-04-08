import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Nội dung đã cập nhật', description: 'Nội dung comment mới', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
