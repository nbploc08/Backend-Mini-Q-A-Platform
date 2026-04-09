import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'Email đăng ký' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'User@1234', description: 'Mật khẩu' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
