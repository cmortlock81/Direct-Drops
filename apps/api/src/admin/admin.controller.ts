import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('settings') getSettings() { return this.admin.getSettings(); }
  @Patch('settings') patchSettings(@Body() body: any, @CurrentUser() user: any) { return this.admin.patchSettings(body, user.userId); }

  @Get('sms-templates') templates() { return this.admin.listTemplates(); }
  @Post('sms-templates') createTemplate(@Body() dto: any, @CurrentUser() user: any) { return this.admin.createTemplate(dto, user.userId); }
  @Patch('sms-templates/:templateId') patchTemplate(@Param('templateId') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.admin.patchTemplate(id, dto, user.userId);
  }
}
