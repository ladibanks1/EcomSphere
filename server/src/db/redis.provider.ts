import { Provider } from '@nestjs/common';
import { REDIS } from '../utils/constants';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_PROVIDER: Provider = {
  provide: REDIS,
  useFactory: (configService: ConfigService) =>
    new Redis(
      configService.get<string>('REDIS_URL') || 'redis://localhost:639',
    ),
  inject: [ConfigService],
};
