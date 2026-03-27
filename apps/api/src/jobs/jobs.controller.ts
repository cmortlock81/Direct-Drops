import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { JobStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JobsService } from './jobs.service';

class AssignJobDto { @IsUUID() courierId!: string; }
class UpdateStatusDto {
  @IsEnum(JobStatus) status!: JobStatus;
  @IsOptional() @IsString() reasonCode?: string;
  @IsOptional() @IsString() reasonText?: string;
}

@Controller('jobs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CONTROLLER, Role.COURIER)
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post() @Roles(Role.ADMIN, Role.CONTROLLER)
  create(@Body() dto: any, @CurrentUser() user: any) { return this.jobs.create(dto, user.userId); }

  @Get()
  list(@Query() query: any, @CurrentUser() user: any) { return this.jobs.list(query, { userId: user.userId, role: user.role }); }

  @Get(':jobId')
  find(@Param('jobId') jobId: string, @CurrentUser() user: any) { return this.jobs.find(jobId, { userId: user.userId, role: user.role }); }

  @Patch(':jobId') @Roles(Role.ADMIN, Role.CONTROLLER)
  patch(@Param('jobId') jobId: string, @Body() dto: any) { return this.jobs.patch(jobId, dto); }

  @Post(':jobId/assign') @Roles(Role.ADMIN, Role.CONTROLLER)
  assign(@Param('jobId') jobId: string, @Body() dto: AssignJobDto, @CurrentUser() user: any) {
    return this.jobs.assign(jobId, dto.courierId, user.userId);
  }

  @Post(':jobId/status')
  status(@Param('jobId') jobId: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    return this.jobs.updateStatus(jobId, dto.status, user.userId, user.role, dto.reasonCode, dto.reasonText);
  }

  @Get(':jobId/events')
  events(@Param('jobId') jobId: string, @CurrentUser() user: any) { return this.jobs.events(jobId, { userId: user.userId, role: user.role }); }

  @Get(':jobId/messages')
  messages(@Param('jobId') jobId: string, @CurrentUser() user: any) { return this.jobs.messages(jobId, { userId: user.userId, role: user.role }); }
}
