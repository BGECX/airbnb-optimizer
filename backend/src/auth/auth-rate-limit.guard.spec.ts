import { HttpException, ServiceUnavailableException } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';
import { RedisService } from '../redis/redis.service';

describe('AuthRateLimitGuard', () => {
  it('bloque la onzième tentative distribuée', async () => {
    let count = 0;
    const redis = { isConfigured: () => true, incrementWindow: jest.fn().mockImplementation(async () => ++count) } as unknown as RedisService;
    const guard = new AuthRateLimitGuard(redis);
    const context = { switchToHttp: () => ({ getRequest: () => ({ ip: '192.0.2.10', route: { path: '/test-limit' }, url: '/test-limit' }) }) } as any;
    for (let index = 0; index < 10; index += 1) await expect(guard.canActivate(context)).resolves.toBe(true);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(HttpException);
  });

  it('échoue fermé si Redis configuré est indisponible', async () => {
    const redis = { isConfigured: () => true, incrementWindow: jest.fn().mockRejectedValue(new Error('down')) } as unknown as RedisService;
    const guard = new AuthRateLimitGuard(redis);
    const context = { switchToHttp: () => ({ getRequest: () => ({ ip: '192.0.2.11', route: { path: '/login' }, url: '/login' }) }) } as any;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
