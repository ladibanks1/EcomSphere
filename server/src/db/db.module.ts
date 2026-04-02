import { Module } from '@nestjs/common';
import { DB, REDIS } from '../utils/constants';
import { PG_PROVIDER } from './pg.provider';
import { REDIS_PROVIDER } from './redis.provider';

@Module({
  providers: [PG_PROVIDER, REDIS_PROVIDER],
  exports: [DB, REDIS],
})
export class DbModule {}
