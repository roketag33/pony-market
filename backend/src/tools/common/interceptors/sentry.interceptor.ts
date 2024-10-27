/*
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Start transaction
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${request.method} ${request.path}`,
    });

    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
      // Add user information to the scope if available
      if (request.user) {
        scope.setUser({
          id: request.user.userId,
          email: request.user.email,
        });
      }
      // Add request information
      scope.setContext('http', {
        method: request.method,
        url: request.url,
        headers: request.headers,
      });
    });

    return next.handle().pipe(
      tap({
        next: () => {
          transaction.finish();
        },
        error: (error) => {
          Sentry.captureException(error);
          transaction.finish();
        },
      }),
    );
  }
}
*/
