import { Inject, Injectable } from '@nestjs/common';
import { MailService } from '../mail.service';
import {
  MAX_OTP_ATTEMPTS,
  OTP_ATTEMPTS_KEY,
  OTP_EXPIRY,
  OTP_KEY,
  OTP_SEND_KEY,
  OTP_WINDOW,
  REDIS,
} from '../constants';
import { Redis } from 'ioredis';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private readonly mailService: MailService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  generate_otp() {
    return randomInt(100000, 999999).toString();
  }

  async sendOtp(email: string) {
    const send_count = await this.redis.incr(`${OTP_SEND_KEY}:${email}`);

    if (send_count === 1) {
      await this.redis.expire(`${OTP_SEND_KEY}:${email}`, OTP_WINDOW);
    }

    if (send_count > MAX_OTP_ATTEMPTS) {
      const ttl = await this.redis.ttl(`${OTP_SEND_KEY}:${email}`);
      throw new Error(
        `Too many OTP sent attempts. Please try again after ${Math.ceil(ttl / 60)} minutes.`,
      );
    }

    const otp = this.generate_otp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await this.redis.set(`${OTP_KEY}:${email}`, hashedOtp, 'EX', OTP_EXPIRY);

    this.mailService.sendMail(
      email,
      'Your EcomSphere OTP Code',
      `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #121212;
      margin: 0;
      padding: 0;
      color: #e0e0e0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #1e1e1e;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin-bottom: 10px;
    }
    .content p {
      color: #cccccc;
      line-height: 1.6;
      font-size: 16px;
    }
    .otp-code {
      display: inline-block;
      margin: 20px 0;
      padding: 15px 25px;
      font-size: 28px;
      font-weight: bold;
      color: #1e1e1e;
      background-color: #ff9800;
      border-radius: 6px;
      letter-spacing: 4px;
    }
    .footer {
      font-size: 12px;
      color: #888888;
      margin-top: 30px;
    }
    a {
      color: #ff9800;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EcomSphere OTP</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Use the OTP below to complete your action on EcomSphere. This code is valid for the next 5 minutes.</p>
      <div class="otp-code">${otp}</div>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Thanks,<br><strong>The EcomSphere Team</strong></p>
    </div>
    <div class="footer">
      &copy; 2026 EcomSphere. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
    );
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp({ email, otp }: { email: string; otp: string }) {
    const attempts = await this.redis.incr(`${OTP_ATTEMPTS_KEY}:${email}`);

    if (attempts === 1)
      await this.redis.expire(`${OTP_ATTEMPTS_KEY}:${email}`, OTP_EXPIRY);

    if (attempts > MAX_OTP_ATTEMPTS) {
      await this.redis.del(
        `${OTP_ATTEMPTS_KEY}:${email}`,
        `${OTP_KEY}:${email}`,
      );
      throw new Error(`Too many OTP attempts. Request a new otp`);
    }

    const hashedOtp = await this.redis.get(`${OTP_KEY}:${email}`);

    if (!hashedOtp) throw new Error('Invalid or Expired OTP');

    const isMatch = await bcrypt.compare(otp, hashedOtp);

    if (!isMatch) throw new Error('Invalid OTP');

    await this.redis.del(`${OTP_KEY}:${email}`);
    await this.redis.del(`${OTP_ATTEMPTS_KEY}:${email}`);

    return { message: 'OTP verified successfully' };
  }
}
