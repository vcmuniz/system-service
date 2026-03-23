import { PrismaConfigRepository } from '../adapters/persistence/prisma/PrismaConfigRepository';
import { RedisCache } from '../adapters/cache/RedisCache';
import { GetUserConfigUseCase } from '../../application/use-cases/GetUserConfig.usecase';
import { EnvironmentConfig } from '../config/environment.config';

export class Container {
  private static instance: Container;
  public prisma: PrismaClient | null = null;
  public configRepository: PrismaConfigRepository | null = null;
  public cacheService: RedisCache;
  public getUserConfigUseCase: GetUserConfigUseCase | null = null;

  private constructor() {
    // Do not instantiate PrismaClient at module import time to avoid build-time prisma generation issues.
    this.cacheService = new RedisCache(EnvironmentConfig.REDIS_URL);
  }

  static getInstance(): Container { if (!Container.instance) Container.instance = new Container(); return Container.instance; }

  async initialize(): Promise<void> {
    try {
      try:
      const PrismaClient = require('@prisma/client').PrismaClient;
      this.prisma = new PrismaClient({ datasources: { db: { url: EnvironmentConfig.DATABASE_URL } } });
    } catch (err) { console.warn('Prisma client load failed:', err); }
      this.configRepository = new PrismaConfigRepository(this.prisma);
      this.getUserConfigUseCase = new GetUserConfigUseCase(this.configRepository, this.cacheService);
      await this.prisma.$connect();
    } catch (err) { console.warn('Prisma connect/initialize failed:', err); }
  }

  async shutdown(): Promise<void> {
    try { await this.cacheService.disconnect(); } catch {}
    try { if (this.prisma) await this.prisma.$disconnect(); } catch {}
  }
}
