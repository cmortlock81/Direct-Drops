import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const transitions: Record<JobStatus, JobStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['OUT_FOR_DELIVERY', 'CANCELLED', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'CANCELLED'],
  FAILED: ['ASSIGNED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService, private readonly sms: SmsService, private readonly realtime: RealtimeGateway) {}

  async create(data: any, userId: string) {
    const job = await this.prisma.job.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddressLine1: data.deliveryAddress.line1,
        deliveryAddressLine2: data.deliveryAddress.line2,
        deliveryCity: data.deliveryAddress.city,
        deliveryPostcode: data.deliveryAddress.postcode,
        notes: data.notes,
        priority: data.priority ?? 'NORMAL',
        createdByUserId: userId
      }
    });
    await this.addEvent(job.id, 'JOB_CREATED', { status: job.status }, userId);
    this.realtime.emit('job.created', job);
    return job;
  }

  async list(query: any, actor: { userId: string; role: Role }) {
    if (actor.role === 'COURIER') {
      const courier = await this.prisma.courier.findFirst({ where: { userId: actor.userId } });
      if (!courier) return [];
      return this.prisma.job.findMany({
        where: { assignedCourierId: courier.id, ...(query.status ? { status: query.status } : {}) },
        include: { assignedCourier: { include: { user: true } } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }]
      });
    }

    return this.prisma.job.findMany({
      where: { ...(query.status ? { status: query.status } : {}), ...(query.courierId ? { assignedCourierId: query.courierId } : {}) },
      include: { assignedCourier: { include: { user: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }]
    });
  }

  async find(jobId: string, actor: { userId: string; role: Role }) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { assignedCourier: { include: { user: true } }, events: { orderBy: { createdAt: 'desc' } }, smsMessages: { orderBy: { createdAt: 'desc' } } }
    });
    if (!job) throw new NotFoundException('Job not found');

    if (actor.role === 'COURIER') {
      await this.assertCourierOwnsJob(job.id, actor.userId);
    }
    return job;
  }

  patch(jobId: string, data: any) { return this.prisma.job.update({ where: { id: jobId }, data }); }

  async assign(jobId: string, courierId: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (['DELIVERED', 'CANCELLED'].includes(job.status)) throw new BadRequestException('Read-only terminal job');

    const courier = await this.prisma.courier.findUnique({ where: { id: courierId }, include: { user: true } });
    if (!courier?.user?.isActive) throw new BadRequestException('Courier must be active');

    const updated = await this.prisma.job.update({ where: { id: jobId }, data: { assignedCourierId: courierId, status: 'ASSIGNED', assignedAt: new Date() } });
    await this.addEvent(jobId, 'JOB_ASSIGNED', { courierId }, userId);
    await this.sms.sendForJob('ASSIGNED', updated, courier.user.name);
    this.realtime.emit('job.assigned', updated);
    return updated;
  }

  async updateStatus(jobId: string, status: JobStatus, userId: string, actorRole: Role, reasonCode?: string, reasonText?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    if (actorRole === 'COURIER') {
      await this.assertCourierOwnsJob(job.id, userId);
      if (!['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
        throw new ForbiddenException('Courier cannot set that status');
      }
    }

    if (!transitions[job.status].includes(status)) throw new BadRequestException(`Invalid transition ${job.status} -> ${status}`);

    const timeMap: Record<string, any> = {
      OUT_FOR_DELIVERY: { outForDeliveryAt: new Date() },
      DELIVERED: { deliveredAt: new Date() },
      FAILED: { failedAt: new Date() },
      CANCELLED: { cancelledAt: new Date() }
    };

    const updated = await this.prisma.job.update({ where: { id: jobId }, data: { status, ...(timeMap[status] || {}) } });
    await this.addEvent(jobId, 'JOB_STATUS_CHANGED', { from: job.status, to: status, reasonCode, reasonText }, userId);
    if (['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) await this.sms.sendForJob(status, updated);
    this.realtime.emit('job.status_changed', updated);
    return updated;
  }

  async events(jobId: string, actor: { userId: string; role: Role }) {
    if (actor.role === 'COURIER') await this.assertCourierOwnsJob(jobId, actor.userId);
    return this.prisma.jobEvent.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' } });
  }

  async messages(jobId: string, actor: { userId: string; role: Role }) {
    if (actor.role === 'COURIER') await this.assertCourierOwnsJob(jobId, actor.userId);
    return this.prisma.smsMessage.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' } });
  }

  addEvent(jobId: string, eventType: string, eventPayload: any, createdByUserId?: string) {
    return this.prisma.jobEvent.create({ data: { jobId, eventType, eventPayload, createdByUserId } });
  }

  private async assertCourierOwnsJob(jobId: string, userId: string) {
    const courier = await this.prisma.courier.findFirst({ where: { userId } });
    if (!courier) throw new ForbiddenException('Courier profile missing');

    const job = await this.prisma.job.findFirst({ where: { id: jobId, assignedCourierId: courier.id } });
    if (!job) throw new ForbiddenException('Courier can only access assigned jobs');
  }
}
