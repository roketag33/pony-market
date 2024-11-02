import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = [
  {
    name: 'short',
    ttl: 60000, // 1 minute
    limit: 10,
  },
  {
    name: 'medium',
    ttl: 300000, // 5 minutes
    limit: 100,
  },
  {
    name: 'long',
    ttl: 3600000, // 1 heure
    limit: 1000,
  },
];
