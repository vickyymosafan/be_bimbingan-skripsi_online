/**
 * Response Interceptor
 * Memformat response API sesuai standar
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: unknown[];
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Format response sesuai standar
        const formattedResponse: Response<T> = {
          status: 'success',
          message:
            typeof data === 'object' &&
            data !== null &&
            'message' in data &&
            typeof (data as Record<string, unknown>).message === 'string'
              ? ((data as Record<string, unknown>).message as string)
              : 'Berhasil',
        };

        // Jika data memiliki property message dan data, gunakan itu
        if (data && typeof data === 'object' && 'data' in data) {
          formattedResponse.data = (data as Record<string, unknown>).data as T;
        } else {
          // Jika tidak, gunakan data langsung
          formattedResponse.data = data as T;
        }

        return formattedResponse;
      }),
    );
  }
}
