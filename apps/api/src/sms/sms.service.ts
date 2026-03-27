import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  constructor(private readonly prisma: PrismaService) {}

  async sendForJob(eventKey: string, job: any, courierName?: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { eventKey } });
    const global = await this.prisma.adminSetting.findUnique({ where: { key: 'sms_sending_enabled' } });
    if (!template?.isEnabled || global?.value === false) return;
    const body = template.body
      .replaceAll('{{customerName}}', job.customerName)
      .replaceAll('{{courierName}}', courierName ?? 'our courier')
      .replaceAll('{{jobId}}', job.id)
      .replaceAll('{{addressLine1}}', job.deliveryAddressLine1)
      .replaceAll('{{status}}', job.status);

    const record = await this.prisma.smsMessage.create({
      data: { jobId: job.id, customerPhone: job.customerPhone, templateKey: eventKey, status: 'QUEUED' }
    });

    if (!this.client || !process.env.TWILIO_FROM_NUMBER) {
      this.logger.warn('Twilio not configured, storing simulated queued SMS');
      return record;
    }

    try {
      const sent = await this.client.messages.create({
        body,
        to: job.customerPhone,
        from: process.env.TWILIO_FROM_NUMBER,
        statusCallback: `${process.env.API_BASE_URL}/api/v1/webhooks/twilio/message-status`
      });
      return this.prisma.smsMessage.update({ where: { id: record.id }, data: { status: sent.status, providerMessageSid: sent.sid, sentAt: new Date() } });
    } catch (e: any) {
      return this.prisma.smsMessage.update({ where: { id: record.id }, data: { status: 'FAILED', errorMessage: e.message } });
    }
  }
}
