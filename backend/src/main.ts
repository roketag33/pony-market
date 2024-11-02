import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './tools/common/filters/all-exceptions.filter';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { corsConfig } from './config/cors.config';
import { SecurityMiddleware } from './middleware/security.middleware';

declare const module: any;

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      snapshot: true,
      logger: ['error', 'warn', 'log', 'debug'],
      bufferLogs: true,
    });

    // Sécurité
    app.use(new SecurityMiddleware().use);
    app.enableCors(corsConfig(process.env));
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });

    // Performance
    app.use(
      compression({
        level: 6,
        threshold: 0,
      }),
    );

    // Assets statiques
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
      maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
      etag: true,
    });

    // Validation et Filtres
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        forbidUnknownValues: true,
        validationError: {
          target: false,
        },
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('API Marketplace')
      .setDescription("API de la marketplace d'équitation")
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(process.env.BASE_URL || 'http://localhost:3000')
      .addTag('security', 'Endpoints protégés nécessitant une authentification')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, () => document, {
      swaggerOptions: {
        persistAuthorization: true,
        security: [{ bearer: [] }],
      },
    });

    // Gestion des signaux
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, gracefully shutting down...`);
        await app.close();
        process.exit(0);
      });
    });

    // Démarrage du serveur
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(
      `Application started on port ${port} in ${process.env.NODE_ENV} mode`,
    );

    // Configuration du Hot Module Replacement (HMR)
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    logger.error('Error during bootstrap:', error);
    process.exit(1);
  }
}

// Gestion des erreurs globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
