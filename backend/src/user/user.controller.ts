import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

import { CreateUserdto } from './dto/create-user.dto';
import { UserResponsedto } from './dto/Responses/user-response.dto';
import { ListUsersResponsedto } from './dto/Responses/list-users-response.dto';
import { DeleteUserResponsedto } from './dto/Responses/delete-user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserdto: CreateUserdto) {
    return this.userService.create(createUserdto);
  }

  @Get()
  async findAll(): Promise<ListUsersResponsedto> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponsedto> {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserdto: CreateUserdto) {
    return this.userService.update(+id, updateUserdto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteUserResponsedto> {
    return this.userService.remove(+id);
  }

  @Post('request-reset-password')
  async requestResetPassword(@Body('email') email: string) {
    return this.userService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.userService.resetPassword(resetToken, newPassword);
  }
}
