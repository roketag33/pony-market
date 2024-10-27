/*
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Capture exception in Sentry with additional context
    Sentry.withScope((scope) => {
      scope.setExtra('path', request.url);
      scope.setExtra('method', request.method);

      if (request.user) {
        scope.setUser({
          id: request.user.userId,
          email: request.user.email,
        });
      }

      if (status >= 500) {
        Sentry.captureException(exception);
      }
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    });
  }
}
*/
