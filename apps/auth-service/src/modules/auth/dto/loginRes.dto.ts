import { IsArray, IsEmail, IsInt, IsString } from 'class-validator';

export class loginResponseDto {
  @IsString()
  id: string;
  @IsEmail()
  email: string;
  @IsInt()
  permVersion: number;
  @IsArray()
  @IsString({ each: true })
  roles: string[];
  @IsString()
  access_token: string;
}
