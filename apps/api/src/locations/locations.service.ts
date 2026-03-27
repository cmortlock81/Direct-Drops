import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService, private readonly realtime: RealtimeGateway) {}

  async push(userId: string, dto: any) {
    const courier = await this.prisma.courier.findFirst({ where: { userId } });
    if (!courier) throw new NotFoundException('Courier profile missing');
    const loc = await this.prisma.courierLocation.create({ data: { courierId: courier.id, ...dto, capturedAt: new Date(dto.capturedAt) } });
    await this.prisma.courier.update({ where: { id: courier.id }, data: { lastLocationAt: new Date(dto.capturedAt) } });
    this.realtime.emit('courier.location_updated', loc);
    return loc;
  }

  latest() {
    return this.prisma.courier.findMany({ include: { user: true, locations: { take: 1, orderBy: { capturedAt: 'desc' } } } });
  }

  history(courierId: string) {
    return this.prisma.courierLocation.findMany({ where: { courierId }, orderBy: { capturedAt: 'desc' }, take: 200 });
  }
}
