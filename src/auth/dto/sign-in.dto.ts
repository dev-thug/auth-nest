// src/auth/dto/sign-in.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class SignInDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
