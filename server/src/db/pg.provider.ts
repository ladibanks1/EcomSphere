import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DB } from '../utils/constants';

export const PG_PROVIDER: Provider = {
  provide: DB,
  useFactory: (configService: ConfigService) => {
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
    });
    console.log('Database connection started');
    return pool;
  },
  inject: [ConfigService],
};
