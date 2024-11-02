// src/tools/prisma/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to database...');
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error.stack);
      throw error;
    }

    // Soft delete middleware
    this.$use(async (params, next) => {
      if (params.model && params.action === 'delete') {
        // Convert delete to update
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.model && params.action === 'deleteMany') {
        // Convert deleteMany to updateMany
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database...');
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error.stack);
      throw error;
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'development') {
      const tableNames = await this.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

      const tables = tableNames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations');

      return Promise.all(
        tables.map((tableName) =>
          this.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`),
        ),
      );
    }
    throw new Error('This method can only be used in development');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
      return false;
    }
  }
}
