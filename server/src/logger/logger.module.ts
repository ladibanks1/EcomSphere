import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class LoggerModule {}
