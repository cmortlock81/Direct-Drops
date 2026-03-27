import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  log(jobId: string, eventType: string, payload: unknown, userId?: string) {
    return this.prisma.jobEvent.create({ data: { jobId, eventType, eventPayload: payload as any, createdByUserId: userId } });
  }
}
