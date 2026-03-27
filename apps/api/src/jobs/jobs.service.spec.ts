import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';

function buildService(jobStatus: string, assignedCourierId = 'courier-1') {
  const prisma: any = {
    job: {
      findUnique: jest.fn().mockResolvedValue({ id: 'job-1', status: jobStatus, assignedCourierId }),
      findFirst: jest.fn().mockResolvedValue({ id: 'job-1', assignedCourierId }),
      update: jest.fn().mockResolvedValue({ id: 'job-1', status: 'OUT_FOR_DELIVERY' })
    },
    courier: { findFirst: jest.fn().mockResolvedValue({ id: assignedCourierId }) },
    jobEvent: { create: jest.fn().mockResolvedValue({}) },
    smsMessage: { findMany: jest.fn() }
  };
  const sms: any = { sendForJob: jest.fn().mockResolvedValue(undefined) };
  const realtime: any = { emit: jest.fn() };
  return { service: new JobsService(prisma, sms, realtime), prisma };
}

describe('JobsService', () => {
  it('rejects invalid transition', async () => {
    const { service } = buildService('NEW');
    await expect(service.updateStatus('job-1', 'DELIVERED', 'u1', 'CONTROLLER')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects courier forbidden status', async () => {
    const { service } = buildService('ASSIGNED');
    await expect(service.updateStatus('job-1', 'CANCELLED', 'u1', 'COURIER')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows valid courier transition', async () => {
    const { service, prisma } = buildService('ASSIGNED');
    await service.updateStatus('job-1', 'OUT_FOR_DELIVERY', 'u1', 'COURIER');
    expect(prisma.job.update).toHaveBeenCalled();
  });
});
