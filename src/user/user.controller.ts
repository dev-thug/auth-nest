//src/user/user.controller.ts

import { Body, Controller, Get, Request, Put } from '@nestjs/common';

import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  @Roles(Role.Admin)
  fineAll() {
    return this.userService.findAll();
  }

  @Put('/password')
  changePassword(
    @Request() request: any,
    @Body() passwordDto: ChangePasswordDto,
  ) {
    const email = request.user.username;
    const { oldPassword, newPassword, newPasswordConfirm } = passwordDto;
    return this.userService.changePassword(
      email,
      oldPassword,
      newPassword,
      newPasswordConfirm,
    );
  }
}
