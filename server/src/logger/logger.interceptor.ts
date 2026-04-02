import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() =>
        this.logger.log('Request completed', {
          method: req.method,
          url: req.url,
          responseTime: `${Date.now() - now}ms`,
          responseCode: res.statusCode,
          user: (req.body as { email?: string })?.email || req.ip,
        }),
      ),
      catchError((err) => {
        this.logger.error('Request error', {
          method: req.method,
          url: req.url,
          responseTime: `${Date.now() - now}ms`,
          responseCode: res.statusCode,
          user: (req.body as { email?: string })?.email || req.ip,
          error: (err as { message: string }).message,
        });
        throw err;
      }),
    );
  }
}
