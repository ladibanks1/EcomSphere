import { Injectable } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }
  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
  warn(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}
