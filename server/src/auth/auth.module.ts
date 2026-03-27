import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from '../db/db.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [DbModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
