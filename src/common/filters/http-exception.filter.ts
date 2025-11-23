/**
 * HTTP Exception Filter
 * Menangani dan memformat error response
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let errors: unknown = null;

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        message =
          (typeof body.message === 'string' ? body.message : undefined) ||
          message;
        errors = body.errors || null;

        // Handle validation errors dari class-validator
        if (Array.isArray(body.message)) {
          errors = body.message;
          message = 'Validasi gagal';
        }
      } else if (typeof responseBody === 'string') {
        message = responseBody;
      } else {
        message = JSON.stringify(responseBody);
      }
    }

    // Handle TypeORM errors
    const err = exception as { code?: string; stack?: string };
    if (err.code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Data sudah ada';
    } else if (err.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Data terkait tidak ditemukan';
    } else if (err.code === '23502') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Data tidak lengkap';
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      err.stack,
    );

    // Send response
    response.status(status).json({
      status: 'error',
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
