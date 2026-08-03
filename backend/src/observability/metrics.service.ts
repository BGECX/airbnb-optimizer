import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private requests = 0;
  private errors = 0;
  private totalDurationMs = 0;

  record(status: number, durationMs: number) {
    this.requests += 1;
    this.totalDurationMs += durationMs;
    if (status >= 500) this.errors += 1;
  }

  snapshot() {
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1_000),
      requestsTotal: this.requests,
      serverErrorsTotal: this.errors,
      averageDurationMs: this.requests ? Math.round((this.totalDurationMs / this.requests) * 100) / 100 : 0,
      timestamp: new Date().toISOString(),
    };
  }
}
