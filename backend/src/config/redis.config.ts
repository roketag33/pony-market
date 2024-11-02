import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

export const RedisConfig = CacheModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    store: redisStore as any,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB', 0),
    ttl: configService.get('REDIS_TTL', 60 * 60 * 24),
    max: 1000,
    isGlobal: true,
  }),
  inject: [ConfigService],
});
