import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get() @Roles(Role.ADMIN, Role.CONTROLLER)
  list(@Query('role') role?: string) { return this.users.list(role); }

  @Post() @Roles(Role.ADMIN)
  create(@Body() dto: any) { return this.users.create(dto); }

  @Patch(':userId') @Roles(Role.ADMIN)
  update(@Param('userId') userId: string, @Body() dto: any) { return this.users.update(userId, dto); }

  @Post(':userId/activate') @Roles(Role.ADMIN)
  activate(@Param('userId') userId: string) { return this.users.activate(userId); }

  @Post(':userId/deactivate') @Roles(Role.ADMIN)
  deactivate(@Param('userId') userId: string) { return this.users.deactivate(userId); }

  @Post(':userId/reset-password') @Roles(Role.ADMIN)
  resetPassword(@Param('userId') userId: string, @Body() dto: any) { return this.users.resetPassword(userId, dto.password); }
}
