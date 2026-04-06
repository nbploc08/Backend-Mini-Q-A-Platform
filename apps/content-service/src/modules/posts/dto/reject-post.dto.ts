import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
