import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60000), // 60 secondes par défaut
          limit: config.get('THROTTLE_LIMIT', 100), // 100 requêtes par ttl par défaut
        },
      ],
    }),
  ],
})
export class RateLimitingModule {}
