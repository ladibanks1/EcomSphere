import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { type Request } from 'express';
import { verifyToken } from './utils/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    try {
      verifyToken(token);
      return true;
    } catch (e) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
