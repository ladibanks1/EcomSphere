import { Inject, Injectable } from '@nestjs/common';
import { DB } from '../utils/constants';
import { Pool } from 'pg';
import { loginDto, signInDto } from './dto/auth.dto';
import bcrypt from 'bcrypt';
import { getOne } from '../utils/db';
import { createToken } from '../utils/jwt';
import crypto from 'crypto';

interface ErrorWithCode extends Error {
  code?: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(DB) private db: Pool) {}

  // Create a new user in the database check it dto for details
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

  async login(data: loginDto) {
    try {
      const res = await this.db.query(
        'SELECT id,email,password,is_verified FROM users WHERE  email = $1',
        [data.email],
      );
      const user = getOne<{
        email: string;
        password: string;
        is_verified: boolean;
        id: string;
      }>(res);

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user?.password || 'fakehash',
      );
      if (!user || !isPasswordValid) throw new Error('Invalid credentials');
      if (!user.is_verified) throw new Error('User not verified');

      const accessToken = createToken({ userId: user.id }, '15m');

      const refreshToken = await this.generateRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch (e) {
      const err = e as Error;
      throw new Error(err?.message || 'An error occurred while logging in');
    }
  }

  async refresh(token: string) {
    try {
      const tokenRecord = getOne<{
        revoked: boolean;
        expires_at: Date;
        user_id: string;
      }>(
        await this.db.query(
          'SELECT expires_at,revoked,user_id FROM refresh_tokens WHERE token=$1',
          [token],
        ),
      );
      if (!tokenRecord || tokenRecord.expires_at < new Date())
        throw new Error('Session Timeout');

      const result = await this.db.query(
        `UPDATE refresh_tokens
         SET revoked = true
         WHERE token = $1
           AND revoked = false
         RETURNING *`,
        [token],
      );

      if (getOne(result) === null) {
        await this.db.query(
          'UPDATE refresh_tokens SET revoked=true WHERE user_id=$1',
          [tokenRecord.user_id],
        );

        throw new Error('Session compromised. Please login again.');
      }

      const accessToken = createToken({ userId: tokenRecord.user_id }, '15m');
      const refreshToken = await this.generateRefreshToken(tokenRecord.user_id);

      return { accessToken, refreshToken };
    } catch (e) {
      throw new Error((e as Error).message || "Session Timeout'");
    }
  }

  private async generateRefreshToken(id: string) {
    try {
      const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const refreshToken = crypto.randomBytes(64).toString('hex');

      const query = await this.db.query(
        'INSERT INTO refresh_tokens(user_id , token , expires_at) VALUES ($1,$2,$3) RETURNING *',
        [id, refreshToken, refreshExpiry],
      );
      if (getOne(query) === null)
        throw new Error('An error occurred while generating refresh token');
      return refreshToken;
    } catch (e) {
      throw new Error(
        (e as Error).message ||
          'An error occurred while generating refresh token',
      );
    }
  }
}
