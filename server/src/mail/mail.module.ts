import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { OtpService } from './otp.service';

@Module({
  providers: [MailService, OtpService],
  exports: [OtpService],
})
export class MailModule {}
