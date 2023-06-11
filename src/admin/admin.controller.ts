import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SignupMode } from 'src/common/enums/sign-mode.enum';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
