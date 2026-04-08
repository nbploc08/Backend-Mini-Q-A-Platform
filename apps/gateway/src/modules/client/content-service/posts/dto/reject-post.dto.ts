import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectPostDto {
  @ApiPropertyOptional({ example: 'Nội dung không phù hợp', description: 'Lý do từ chối', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
