import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouriersService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.courier.findMany({ include: { user: true } }); }
  update(courierId: string, data: any) { return this.prisma.courier.update({ where: { id: courierId }, data }); }
}
