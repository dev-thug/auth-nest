// src/user/user.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
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
    }

    await this.userRepository.save(user);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
