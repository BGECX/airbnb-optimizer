import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class PlatformWebhookVerifier {
  constructor(private readonly config: ConfigService) {}

  verify(rawBody: Buffer | undefined, timestamp: string | undefined, eventId: string | undefined, signature: string | undefined) {
    const secret = this.config.get<string>('PA_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Webhook de plateforme non configuré');
    if (!rawBody || !timestamp || !eventId || !signature) throw new UnauthorizedException('Signature de webhook incomplète');
    const epochSeconds = Number(timestamp);
    if (!Number.isInteger(epochSeconds) || Math.abs(Date.now() - epochSeconds * 1000) > 5 * 60 * 1000) {
      throw new UnauthorizedException('Webhook expiré ou horodatage invalide');
    }
    const suppliedHex = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) throw new UnauthorizedException('Signature de webhook invalide');
    const expected = createHmac('sha256', secret).update(`${timestamp}.${eventId}.`).update(rawBody).digest();
    const supplied = Buffer.from(suppliedHex, 'hex');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new UnauthorizedException('Signature de webhook invalide');
  }
}
