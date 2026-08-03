import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) return;
    this.client = createClient({
      url,
      socket: { connectTimeout: 2_000, reconnectStrategy: (retries) => retries >= 3 ? false : Math.min(100 * 2 ** retries, 1_000) },
    });
    this.client.on('error', () => undefined);
    try {
      await this.client.connect();
      this.logger.log('Redis connecté');
    } catch {
      this.logger.error('Redis indisponible au démarrage');
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) await this.client.quit().catch(() => undefined);
  }

  isConfigured() { return Boolean(this.config.get<string>('REDIS_URL')); }
  isReady() { return Boolean(this.client?.isReady); }

  async ping() {
    if (!this.client?.isReady) return false;
    try { return await this.client.ping() === 'PONG'; } catch { return false; }
  }

  async incrementWindow(key: string, windowMs: number) {
    if (!this.client?.isReady) throw new Error('Redis indisponible');
    const result = await this.client.eval(
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n",
      { keys: [key], arguments: [String(windowMs)] },
    );
    return Number(result);
  }
}
