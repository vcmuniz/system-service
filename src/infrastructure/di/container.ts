import { PrismaClient } from '@prisma/client';
import { PrismaConfigRepository } from '../adapters/persistence/prisma/PrismaConfigRepository';
import { RedisCache } from '../adapters/cache/RedisCache';
import { GetUserConfigUseCase } from '../../application/use-cases/GetUserConfig.usecase';
import { EnvironmentConfig } from '../config/environment.config';

export class Container {
  private static instance: Container;
  public readonly prisma: PrismaClient;
  public readonly configRepository: PrismaConfigRepository;
  public readonly cacheService: RedisCache;
  public readonly getUserConfigUseCase: GetUserConfigUseCase;

  private constructor() {
    this.prisma = new PrismaClient({ datasources: { db: { url: EnvironmentConfig.DATABASE_URL } } });
    this.cacheService = new RedisCache(EnvironmentConfig.REDIS_URL);
    this.configRepository = new PrismaConfigRepository(this.prisma);

    this.getUserConfigUseCase = new GetUserConfigUseCase(this.configRepository, this.cacheService);
  }

  static getInstance(): Container { if (!Container.instance) Container.instance = new Container(); return Container.instance; }

  async initialize(): Promise<void> {
    try { await this.prisma.$connect(); } catch (err) { console.warn('Prisma connect failed:', err); }
  }

  async shutdown(): Promise<void> {
    try { await this.cacheService.disconnect(); } catch {}
    try { await this.prisma.$disconnect(); } catch {}
  }
}
