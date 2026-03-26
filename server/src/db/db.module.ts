import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { DB_PROVIDER } from '../constants';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        });
        console.log('Database connection started');
        return pool;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_PROVIDER],
})
export class DbModule {}
