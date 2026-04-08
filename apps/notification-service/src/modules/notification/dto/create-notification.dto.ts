import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { NotificationType } from '.prisma/notification-client';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsInt()
  referenceId?: number;
}
