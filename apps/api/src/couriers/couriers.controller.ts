import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouriersService } from './couriers.service';

@Controller('couriers')
@UseGuards(AuthGuard('jwt'))
export class CouriersController {
  constructor(private readonly couriers: CouriersService) {}
  @Get() list() { return this.couriers.list(); }
  @Patch(':courierId') update(@Param('courierId') courierId: string, @Body() dto: any) { return this.couriers.update(courierId, dto); }
}
