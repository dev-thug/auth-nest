// src/user/user.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { ConfirmationStatus } from 'src/common/enums/confirmation-status.enums';
import { AdminService } from 'src/admin/admin.service';
import { SignupMode } from 'src/common/enums/sign-mode.enum';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { Bcrypt } from 'src/common/util/hash-password.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private adminService: AdminService,
  ) {}

  async save(signUpDto: SignUpDto): Promise<User> {
    const { email, password, passwordConfirm } = signUpDto;
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        'Password and password confirm does not match',
      );
    }

    // TODO - check if password is strong enough

    if (await this.findOneByEmail(email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = new User();
    user.email = signUpDto.email;
    user.password = await new Bcrypt().hashPassword(password);

    if (this.adminService.getSignupMode() === SignupMode.NoEmailVerification) {
      user.status = UserStatus.ACTIVE;
      user.confirmationStatus = ConfirmationStatus.CONFIRMED;
    } else {
      user.status = UserStatus.INACTIVE;
      user.confirmationStatus = ConfirmationStatus.PENDING;
    }

    await this.userRepository.save(user);
    return user;
  }
  async updateConfirmedUser(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the status and save the user.
    user.status = UserStatus.ACTIVE;
    user.confirmationStatus = ConfirmationStatus.CONFIRMED;
    user.emailVerified = true;
    user.approvedAt = new Date();

    return await this.userRepository.save(user);
  }

  async updateUserStatus(email: string, status: UserStatus) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;

    return await this.userRepository.save(user);
  }

  async updateConfirmStatus(
    email: string,
    confirmationStatus: ConfirmationStatus,
  ) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.confirmationStatus = confirmationStatus;

    return await this.userRepository.save(user);
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string,
  ) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await new Bcrypt().comparePassword(
      oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException(
        'New password and password confirmation do not match',
      );
    }

    if (user.email === 'admin@domain.com') {
      throw new BadRequestException(
        'New password and password confirmation do not match',
      );
    }

    user.password = await new Bcrypt().hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
