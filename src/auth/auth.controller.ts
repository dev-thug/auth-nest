// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('verify')
  getProfile(@Request() req) {
    console.log(req);
    return req.user;
  }
}
