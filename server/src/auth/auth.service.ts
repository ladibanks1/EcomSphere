import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../utils/constants';
import { Pool } from 'pg';
import { signInDto } from './dto/signin.dto';
import bcrypt from 'bcrypt';

interface ErrorWithCode extends Error {
  code?: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(DB) private db: Pool) {}

  async createUser(details: signInDto) {
    try {
      const password = await bcrypt.hash(details.password, 10);
      await this.db.query(
        'INSERT INTO users (email,password,role) VALUES ($1,$2,$3)',
        [details.email, password, details.role],
      );
      return;
    } catch (e: unknown) {
      const err = e as ErrorWithCode;
      if (err.code === '23505')
        throw new Error('User with this email already exists');
      else {
        throw new Error(
          err?.message || 'An error occurred while creating the user',
        );
      }
    }
  }
}
