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

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let errors = null;

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || message;
        errors = (responseBody as any).errors || null;

        // Handle validation errors dari class-validator
        if (Array.isArray(message)) {
          errors = message;
          message = 'Validasi gagal';
        }
      } else {
        message = responseBody.toString();
      }
    }

    // Handle TypeORM errors
    if (exception.code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Data sudah ada';
    } else if (exception.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Data terkait tidak ditemukan';
    } else if (exception.code === '23502') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Data tidak lengkap';
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception.stack,
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
