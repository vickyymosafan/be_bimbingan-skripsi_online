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
  errors?: any[];
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        // Format response sesuai standar
        const formattedResponse: Response<T> = {
          status: 'success',
          message: data?.message || 'Berhasil',
        };

        // Jika data memiliki property message dan data, gunakan itu
        if (data && typeof data === 'object' && 'data' in data) {
          formattedResponse.data = data.data;
        } else {
          // Jika tidak, gunakan data langsung
          formattedResponse.data = data;
        }

        return formattedResponse;
      }),
    );
  }
}
