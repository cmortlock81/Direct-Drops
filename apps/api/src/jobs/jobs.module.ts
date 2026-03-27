import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SmsModule } from '../sms/sms.module';

@Module({ imports: [SmsModule], controllers: [JobsController], providers: [JobsService] })
export class JobsModule {}
