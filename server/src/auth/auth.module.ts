import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from '../db/db.module';
import { OtpService } from './otp.service';
import { MailService } from '../mail.service';
@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, MailService],
})
export class AuthModule {}
