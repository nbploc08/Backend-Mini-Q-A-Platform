import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng nhập' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss123', description: 'Mật khẩu' })
  @IsNotEmpty()
  @IsString()
  password?: string;
}
