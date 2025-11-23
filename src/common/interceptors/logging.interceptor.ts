/**
 * Logging Interceptor
 * Mencatat semua request dan response untuk keperluan debugging
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; url: string; body: unknown }>();
    const { method, url, body } = request;
    const now = Date.now();

    // Log request
    this.logger.log(
      `[REQUEST] ${method} ${url} - Body: ${JSON.stringify(body)}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context
            .switchToHttp()
            .getResponse<{ statusCode: number }>();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          // Log response
          this.logger.log(
            `[RESPONSE] ${method} ${url} - Status: ${statusCode} - Time: ${responseTime}ms`,
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - now;

          // Log error
          this.logger.error(
            `[ERROR] ${method} ${url} - Error: ${error.message} - Time: ${responseTime}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
