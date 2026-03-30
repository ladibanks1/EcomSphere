import { createTransport } from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: ReturnType<typeof createTransport>;

  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        to,
        subject,
        html,
      });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }
}
