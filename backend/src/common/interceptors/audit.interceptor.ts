import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next.handle();
    const startedAt = Date.now();
    const fields = Object.keys(request.body ?? {}).map((field) => ['password', 'token', 'secret'].some((word) => field.toLowerCase().includes(word)) ? '[SENSIBLE]' : field);
    const write = (status: number) => {
      void this.prisma.journalAudit.create({ data: {
        userId: request.user?.sub,
        methode: request.method,
        chemin: request.route?.path ? `${request.baseUrl ?? ''}${request.route.path}` : request.url,
        statutHttp: status,
        adresseIp: request.ip,
        userAgent: request.headers['user-agent'],
        champs: [...new Set(fields), `durationMs:${Date.now() - startedAt}`],
      } }).catch(() => undefined);
    };
    return next.handle().pipe(tap({ next: () => write(response.statusCode), error: (error) => write(error?.status ?? 500) }));
  }
}
