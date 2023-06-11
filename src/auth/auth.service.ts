import * as speakeasy from 'speakeasy';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AdminService } from 'src/admin/admin.service';
import { Bcrypt } from 'src/common/util/hash-password.util';
import { ConfirmationStatus } from 'src/common/enums/confirmation-status.enums';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './../mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { Role } from 'src/common/enums/role.enum';
import { SignUpDto } from './dto/sign-up.dto';
import { SignupMode } from 'src/common/enums/sign-mode.enum';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { jwtConstants } from './constants';

//src/auth/auth.service.ts
interface Payload {
  sub: number;
  username: string;
  role: Role;
  status: UserStatus;
  confirmationStatus: ConfirmationStatus;
  emailVerified: boolean;
}

const accessExp = '15m';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const user = await this.userService.findOneByEmail(signUpDto.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }

    // TODO 이메일 검증 안할시 최적화 필요
    const verificationJwt = await this.generateVerificationJwt(signUpDto.email);

    switch (this.adminService.getSignupMode()) {
      case SignupMode.LINK:
        this.mailService.sendMail(signUpDto.email, verificationJwt);
        return await this.userService.save(signUpDto);

      case SignupMode.TOTP:
        const totp = await this.generateTOTP(signUpDto.email);
        await this.mailService.sendMail(signUpDto.email, verificationJwt, totp);
        return await this.userService.save(signUpDto);

      case SignupMode.NoEmailVerification:
        return await this.userService.save(signUpDto);
      default:
        // TODO - send an alert to admin by slack or email
        throw new BadRequestException('Invalid signup mode');
    }
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.generateTOTP(email);
    const isPasswordValid = await new Bcrypt().comparePassword(
      pass,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const payload: Payload = {
      sub: user.id,
      username: user.email,
      role: user.role,
      status: user.status,
      confirmationStatus: user.confirmationStatus,
      emailVerified: user.emailVerified,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: accessExp,
      }),
      refresh_token: await this.generateRefreshToken(user),
    };
  }

  private async generateTOTP(email: string) {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    const client = this.redisService.getClient();
    const exp = 600; // 10 minutes
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      step: exp,
    });

    const redisKey = `totp#${email}`;
    const redisValue = { secret, totp };
    await client.set(redisKey, JSON.stringify(redisValue), 'EX', exp);

    return totp;
  }

  async signUpComfirmByLink(jwt: string) {
    try {
      const client = this.redisService.getClient();

      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: jwtConstants.secret,
      });
      const { email, exp } = payload;

      const redisKey = `link#${email}`;
      const redisExp = Math.floor(exp - Date.now() / 1000);
      const linkToken = await client.get(redisKey);
      // 이미 인증된 토큰인 경우 처리
      if (linkToken && linkToken === jwt) {
        throw new BadRequestException('Used link');
      }
      // 인증된 link 재사용 방지를 위해 캐시 저장
      await client.set(redisKey, jwt, 'EX', redisExp);

      return await this.userService.updateConfirmedUser(payload.email);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async signUpComfirmByTOTP(jwt: string, totp: number) {
    try {
      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: jwtConstants.secret,
      });

      await this.verifyTOTP(payload.email, totp);
      return await this.userService.updateConfirmedUser(payload.email);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async verifyTOTP(email: string, totp: number) {
    const client = this.redisService.getClient();

    const redisKey = `totp#${email}`;
    /**
     * @type {secret: string, totp: number}
     */
    const redisValue = await client.get(redisKey);

    if (!redisValue) {
      throw new BadRequestException('Invalid TOTP');
    }

    const value = JSON.parse(await client.get(redisKey));
    if (+totp !== +value.totp) {
      throw new BadRequestException('Invalid TOTP');
    }

    const verified = speakeasy.totp.verify({
      secret: value.secret,
      encoding: 'base32',
      token: totp,
      window: 2, // 30초의 시간 차 허용
      step: 600,
    });

    // TOPT 캐시 삭제
    await client.del(redisKey);
    return verified;
  }

  private async generateVerificationJwt(email: string): Promise<string> {
    const payload = { email };
    const jwt = await this.jwtService.signAsync(payload, { expiresIn: '1h' });

    return jwt;
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, username: user.email };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const redisClient = this.redisService.getClient();
    await redisClient.set(
      `refreshToken#${user.email}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60,
    );

    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const { sub, username } = this.jwtService.verify(refreshToken);

      const redisClient = this.redisService.getClient();
      const storedRefreshToken = await redisClient.get(
        `refreshToken#${username}`,
      );

      if (!storedRefreshToken && storedRefreshToken !== refreshToken) {
        throw new Error('Unauthorized');
      }

      const user = await this.userService.findOneByEmail(username);
      const payload: Payload = {
        sub: user.id,
        username: user.email,
        role: user.role,
        status: user.status,
        confirmationStatus: user.confirmationStatus,
        emailVerified: user.emailVerified,
      };
      const newAccessToken = await this.jwtService.signAsync(payload, {
        expiresIn: accessExp,
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException();
    }
  }

  async logout(token: string): Promise<void> {
    try {
      /**
       * @type { username: string, exp: number }
       */
      const decoded = this.jwtService.decode(token);

      const { username, exp } = decoded as { username: string; exp: number };

      if (decoded) {
        const redisKey = `blacklist#${username}`;
        const redisExp = Math.floor(exp - Date.now() / 1000);

        const client = this.redisService.getClient();
        if (redisExp > 0) {
          await client.set(redisKey, token, 'EX', redisExp);
        }
        await client.del(`refreshToken#${username}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
