import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof payload === 'string' ? payload : (payload as any)?.message;

    response.status(status).json({
      statusCode: status,
      message: status === 500 ? 'Erreur interne du serveur' : message,
      requestId: (request as Request & { requestId?: string }).requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
