// src/config/cors.config.ts
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig = (env: NodeJS.ProcessEnv): CorsOptions => {
  const allowedOrigins = [
    env.FRONT_ADMIN_URL,
    env.FRONT_CLIENT_URL,
    // Ajoutez d'autres origines autorisées ici
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    maxAge: 3600, // Cache préflight pour 1 heure
    preflightContinue: false,
  };
};
