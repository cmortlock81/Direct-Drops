import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly realtime: RealtimeGateway) {}

  getSettings() { return this.prisma.adminSetting.findMany({ orderBy: { key: 'asc' } }); }

  async patchSettings(payload: Record<string, any>, userId: string) {
    const updates = await Promise.all(Object.entries(payload).map(([key, value]) =>
      this.prisma.adminSetting.upsert({ where: { key }, update: { value, updatedByUserId: userId }, create: { key, value, updatedByUserId: userId } })
    ));
    this.realtime.emit('admin.settings_updated', updates);
    return updates;
  }

  listTemplates() { return this.prisma.smsTemplate.findMany({ orderBy: { eventKey: 'asc' } }); }
  createTemplate(dto: any, userId: string) { return this.prisma.smsTemplate.create({ data: { ...dto, updatedByUserId: userId } }); }
  patchTemplate(id: string, dto: any, userId: string) { return this.prisma.smsTemplate.update({ where: { id }, data: { ...dto, updatedByUserId: userId } }); }
}
