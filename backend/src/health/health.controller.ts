import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@/tools/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Vérification complète de la santé du système' })
  @ApiResponse({
    status: 200,
    description: 'Le système est en bonne santé',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  async check() {
    return this.health.check([
      // Vérification de la base de données
      async () => this.prisma.pingCheck('database', this.prismaService),

      // Vérification de l'API
      async () => this.http.pingCheck('api', `${process.env.BASE_URL}/api`),

      // Vérification de la mémoire
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024), // 3GB

      // Vérification du disque
      async () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9, // 90%
          path: '/',
        }),

      // Vérification de Redis
      async () => this.checkRedis(),
    ]);
  }

  @Get('redis')
  @ApiOperation({ summary: 'Test de la connexion Redis' })
  @ApiResponse({
    status: 200,
    description: 'Redis fonctionne correctement',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        redis: { type: 'string' },
      },
    },
  })
  async testRedis() {
    try {
      // Test d'écriture dans Redis
      await this.cacheManager.set('test', 'Redis fonctionne !', 60);

      // Test de lecture depuis Redis
      const result = await this.cacheManager.get('test');

      return {
        status: 'ok',
        redis: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Erreur Redis: ${error.message}`,
      };
    }
  }

  private async checkRedis() {
    try {
      await this.cacheManager.set('health_check', 'ok', 30);
      const result = await this.cacheManager.get('health_check');

      return {
        redis: {
          status: result === 'ok' ? 'up' : 'down',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  @Get('memory')
  @ApiOperation({ summary: 'État de la mémoire' })
  async checkMemory() {
    const used = process.memoryUsage();
    return {
      status: 'ok',
      memory: {
        heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100 + 'MB',
        heapTotal:
          Math.round((used.heapTotal / 1024 / 1024) * 100) / 100 + 'MB',
        rss: Math.round((used.rss / 1024 / 1024) * 100) / 100 + 'MB',
        external: Math.round((used.external / 1024 / 1024) * 100) / 100 + 'MB',
      },
    };
  }

  @Get('disk')
  @ApiOperation({ summary: 'État du disque' })
  async checkDisk() {
    return this.disk.checkStorage('storage', {
      thresholdPercent: 0.9,
      path: '/',
    });
  }
}
