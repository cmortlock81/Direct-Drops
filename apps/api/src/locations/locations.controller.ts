import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { LocationsService } from './locations.service';

class CourierLocationDto {
  @IsOptional() @IsUUID() jobId?: string;
  @IsNumber() lat!: number;
  @IsNumber() lng!: number;
  @IsOptional() @IsNumber() accuracyMeters?: number;
  @IsOptional() @IsNumber() heading?: number;
  @IsOptional() @IsNumber() speedKph?: number;
  @IsDateString() capturedAt!: string;
}

@Controller('couriers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CONTROLLER, Role.COURIER)
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Post('me/location') @Roles(Role.COURIER)
  push(@CurrentUser() user: any, @Body() dto: CourierLocationDto) { return this.locations.push(user.userId, dto); }

  @Get('locations/latest') @Roles(Role.ADMIN, Role.CONTROLLER)
  latest() { return this.locations.latest(); }

  @Get(':courierId/locations') @Roles(Role.ADMIN, Role.CONTROLLER)
  history(@Param('courierId') courierId: string) { return this.locations.history(courierId); }
}
