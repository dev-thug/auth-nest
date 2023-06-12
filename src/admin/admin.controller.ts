import { Controller, Get, Post } from '@nestjs/common';

import { AdminService } from './admin.service';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SignupMode } from 'src/common/enums/sign-mode.enum';

@Controller('admin')
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/sign/mode')
  async getSignupMode() {
    return { mode: this.adminService.getSignupMode() };
  }

  @Post('/sign/link')
  async updateSignupModeLink() {
    return this.adminService.setSignupMode(SignupMode.LINK);
  }
  @Post('/sign/totp')
  async updateSignupModeTotp() {
    return this.adminService.setSignupMode(SignupMode.TOTP);
  }
  @Post('/sign/no')
  async updateSignupModeNoVerification() {
    return this.adminService.setSignupMode(SignupMode.NoEmailVerification);
  }
}
