import { Controller, Get, Headers, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { MetricsService } from './metrics.service';

@Controller('operations')
export class ObservabilityController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('metrics')
  getMetrics(@Headers('x-metrics-token') supplied?: string) {
    const expected = process.env.METRICS_TOKEN;
    if (!expected) throw new NotFoundException();
    const left = Buffer.from(supplied ?? '');
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) throw new UnauthorizedException('Jeton de métriques invalide');
    return this.metrics.snapshot();
  }
}
