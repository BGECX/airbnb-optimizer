import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private static readonly buckets = new Map<string, { count: number; resetAt: number }>();
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const rawKey = `${request.ip}:${request.route?.path ?? request.url}`;
    const key = `kritia:auth-rate:${createHash('sha256').update(rawKey).digest('hex')}`;
    if (this.redis.isConfigured()) {
      try {
        const count = await this.redis.incrementWindow(key, 15 * 60_000);
        if (count > 10) throw new HttpException('Trop de tentatives, réessayez ultérieurement', HttpStatus.TOO_MANY_REQUESTS);
        return true;
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new ServiceUnavailableException('Protection d’authentification temporairement indisponible');
      }
    }
    return this.localFallback(key);
  }

  private localFallback(key: string) {
    const now = Date.now();
    if (AuthRateLimitGuard.buckets.size > 10_000) {
      for (const [bucketKey, value] of AuthRateLimitGuard.buckets) if (value.resetAt <= now) AuthRateLimitGuard.buckets.delete(bucketKey);
      if (AuthRateLimitGuard.buckets.size > 10_000) {
        const oldestKey = AuthRateLimitGuard.buckets.keys().next().value;
        if (oldestKey) AuthRateLimitGuard.buckets.delete(oldestKey);
      }
    }
    const current = AuthRateLimitGuard.buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + 15 * 60_000 } : current;
    bucket.count += 1;
    AuthRateLimitGuard.buckets.set(key, bucket);
    if (bucket.count > 10) throw new HttpException('Trop de tentatives, réessayez ultérieurement', HttpStatus.TOO_MANY_REQUESTS);
    return true;
  }
}
