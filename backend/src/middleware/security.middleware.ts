// src/middleware/security.middleware.ts
import helmet from 'helmet';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    helmet({
      // Protection contre le Cross-Site Scripting (XSS)
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,

      // Content Security Policy (CSP)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [
            `'self'`,
            `'unsafe-inline'`,
            'https://fonts.googleapis.com',
          ],
          imgSrc: [`'self'`, 'data:', 'https:', 'blob:'],
          scriptSrc: [`'self'`],
          connectSrc: [
            `'self'`,
            process.env.API_URL,
            process.env.STRIPE_API_URL,
          ],
          fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
          mediaSrc: [`'self'`],
          objectSrc: [`'none'`],
          workerSrc: [`'self'`, 'blob:'],
        },
      },

      // Protection contre le Clickjacking
      frameguard: {
        action: 'deny',
      },

      // Protection MIME Type
      noSniff: true,

      // Protection XSS
      xssFilter: true,

      // Strict Transport Security
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },

      // Référer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    })(req, res, next);
  }
}
