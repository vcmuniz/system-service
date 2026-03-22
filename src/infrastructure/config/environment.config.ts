import dotenv from 'dotenv';
dotenv.config();

export class EnvironmentConfig {
  static get PORT(): string { return process.env.PORT || '3003'; }
  static get REDIS_URL(): string { return process.env.REDIS_URL || 'redis://localhost:6379'; }
  static get NODE_ENV(): string { return process.env.NODE_ENV || 'development'; }
  static get DATABASE_URL(): string { return process.env.DATABASE_URL || 'postgresql://stackline:stackline@db:5432/config_db'; }
}
