import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestObservabilityInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const requestId = typeof request.headers['x-request-id'] === 'string' && /^[a-zA-Z0-9._-]{1,100}$/.test(request.headers['x-request-id'])
      ? request.headers['x-request-id'] : randomUUID();
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    const startedAt = Date.now();
    const write = (status: number) => {
      const durationMs = Date.now() - startedAt;
      this.metrics.record(status, durationMs);
      this.logger.log(JSON.stringify({ requestId, method: request.method, path: request.originalUrl, status, durationMs, userId: request.user?.sub }));
    };
    return next.handle().pipe(tap({ next: () => write(response.statusCode), error: (error) => write(error?.status ?? 500) }));
  }
}
