import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from '../db/db.module';
import { MailService } from '../mail.service';

@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [MailService, AuthService],
})
export class AuthModule {}
