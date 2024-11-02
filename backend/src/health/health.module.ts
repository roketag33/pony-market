import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaModule } from '@/tools/prisma/prisma.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Modules de base nécessaires pour les health checks
    TerminusModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT', 5000),
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS', 5),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,

    // Configuration du cache Redis
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as unknown as CacheStore,
        socket: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
        username: configService.get('REDIS_USERNAME'),
        password: configService.get('REDIS_PASSWORD'),
        ttl: configService.get('REDIS_TTL', 60),
        database: configService.get('REDIS_DB', 0),
        // Options de résilience
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        // Options de performance
        keepAlive: 30000,
        connectTimeout: 10000,
        // Options de sécurité
        tls: configService.get('REDIS_TLS_ENABLED') === 'true' ? {} : undefined,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  controllers: [HealthController],
  exports: [CacheModule],

  providers: [
    // Ajoutez ici d'autres providers si nécessaire pour les health checks
  ],
})
export class HealthModule {}
