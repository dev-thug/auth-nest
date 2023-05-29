// src/auth/dto/sign-up.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends PartialType(SignInDto) {
  passwordConfirm: string;
}
