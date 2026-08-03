import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Santé') @Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  @Get('live') live() { return { status: 'ok', service: 'kritia-api', timestamp: new Date().toISOString() }; }
  @Get('ready') async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      if (this.redis.isConfigured() && !await this.redis.ping()) throw new ServiceUnavailableException('Redis indisponible');
      return { status: 'ready', database: 'ok', redis: this.redis.isConfigured() ? 'ok' : 'non_configure', timestamp: new Date().toISOString() };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Base de données indisponible');
    }
  }
}
