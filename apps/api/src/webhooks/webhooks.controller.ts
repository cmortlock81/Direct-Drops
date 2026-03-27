import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import twilio from 'twilio';

@Controller('webhooks/twilio')
export class WebhooksController {
  constructor(private readonly prisma: PrismaService, private readonly realtime: RealtimeGateway) {}

  @Post('message-status')
  async messageStatus(@Body() body: any, @Headers('x-twilio-signature') signature?: string) {
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (token && signature) {
      const valid = twilio.validateRequest(token, signature, `${process.env.API_BASE_URL}/api/v1/webhooks/twilio/message-status`, body);
      if (!valid) throw new UnauthorizedException('Invalid Twilio signature');
    }

    const sid = body.MessageSid;
    const status = body.MessageStatus;
    if (!sid) return { ok: true };

    const sms = await this.prisma.smsMessage.findFirst({ where: { providerMessageSid: sid } });
    if (!sms) return { ok: true };
    const updated = await this.prisma.smsMessage.update({
      where: { id: sms.id },
      data: { status, deliveredAt: status === 'delivered' ? new Date() : undefined, errorCode: body.ErrorCode, errorMessage: body.ErrorMessage }
    });
    this.realtime.emit('sms.status_updated', updated);

    return { ok: true };
  }
}
