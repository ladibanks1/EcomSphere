import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { MailService } from './mail.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

// Otp Data Type
interface IOtp {
  email: string;
  expiresIn: number;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  generate_otp() {
    return randomBytes(4).readUint32BE(0) % 1000000;
  }

  async sendOtp(email: string) {
    const otp = this.generate_otp();
    const expiration_time = Date.now() * 10;
    await this.cacheManager.set<IOtp>(
      String(otp),
      {
        email,
        expiresIn: expiration_time,
      },
      10 * 60 * 1000,
    );

    this.mailService.sendMail(
      email,
      'Your EcomSphere OTP Code',
      `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcomSphere OTP</title>
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
  }

  async verifyOtp(otp: string) {
    const data = await this.cacheManager.get<IOtp>(otp);
    if (data) {
      if (data.expiresIn > Date.now())
        throw new BadRequestException('Otp Expired');
      return data.email;
    } else {
      throw new BadRequestException('Invalid Otp');
    }
  }
}
