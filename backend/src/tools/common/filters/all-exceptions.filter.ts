// src/tools/common/filters/all-exceptions.filter.ts
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
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log détaillé de l'erreur
    this.logger.error({
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      exception: exception instanceof Error ? exception.stack : exception,
    });

    // Ne pas exposer les détails d'erreur en production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Une erreur est survenue'
        : exception instanceof Error
          ? exception.message
          : 'Erreur interne';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      // Ajoutez un code d'erreur unique pour le suivi
      errorId: Math.random().toString(36).substring(7),
    });
  }
}
