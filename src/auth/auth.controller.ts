// src/auth/auth.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
  Request,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerificationLinkDto } from './dto/verification-link.dto';
import { VerificationTotpDto } from './dto/verification-totp.dto';
import { AdminService } from 'src/admin/admin.service';
import { SignupMode } from 'src/common/enums/sign-mode.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.ACCEPTED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return {
      signupType: this.adminService.getSignupMode(),
      ...(await this.authService.signUp(signUpDto)),
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verification/link')
  verificationByLink(@Body() verificationLinkDto: VerificationLinkDto) {
    if (this.adminService.getSignupMode() !== SignupMode.LINK) {
      throw new BadRequestException('Invalid signup mode');
    }
    return this.authService.signUpComfirmByLink(verificationLinkDto.token);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verification/totp')
  verificationByTOTP(@Body() verificationTotpDto: VerificationTotpDto) {
    if (this.adminService.getSignupMode() !== SignupMode.TOTP) {
      throw new BadRequestException('Invalid signup mode');
    }
    return this.authService.signUpComfirmByTOTP(
      verificationTotpDto.token,
      verificationTotpDto.totp,
    );
  }

  @Post('signout')
  signOut(@Request() request: any) {
    const token = request.headers.authorization.split(' ')[1];

    return this.authService.logout(token);
  }

  @Public()
  @Post('/token/refresh')
  async refreshToken(@Headers('refreshToken') authHeader: string) {
    const refreshToken = authHeader && authHeader.split(' ')[1];

    return await this.authService.refreshAccessToken(refreshToken);
  }
}
