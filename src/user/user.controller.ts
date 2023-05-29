//src/user/user.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('/all')
  fineAll() {
    return this.userService.findAll();
  }

  // @Public()
  // @Post()
  // save(@Body() user: User) {
  //   return this.userService.save(user);
  // }
}
