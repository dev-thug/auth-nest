//src/auth/auth.service.ts

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AdminService } from 'src/admin/admin.service';
import { Bcrypt } from 'src/common/util/hash-password.util';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignupMode } from 'src/common/enums/sign-mode.enum';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    switch (this.adminService.getSignupMode()) {
      case SignupMode.EmailVerification:
        // TODO - send email verification link
        return;
      case SignupMode.OTP:
        // TODO - send OTP
        return;
      case SignupMode.NoEmailVerification:
        return await this.userService.save(signUpDto);
      default:
        // TODO - send an alert to admin by slack or email
        throw new BadRequestException('Invalid signup mode');
    }
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    const isPasswordValid = await new Bcrypt().comparePassword(
      pass,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;

    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
