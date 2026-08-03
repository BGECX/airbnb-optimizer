import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PlatformWebhookVerifier } from './platform-webhook-verifier';

describe('PlatformWebhookVerifier', () => {
  const secret = 'secret-webhook-de-test-avec-32-caracteres-minimum';
  const verifier = new PlatformWebhookVerifier({ get: jest.fn().mockReturnValue(secret) } as unknown as ConfigService);

  it('accepte une signature valide', () => {
    const body = Buffer.from('{"status":"ACCEPTEE"}');
    const timestamp = String(Math.floor(Date.now() / 1000));
    const eventId = 'evt-123';
    const signature = createHmac('sha256', secret).update(`${timestamp}.${eventId}.`).update(body).digest('hex');
    expect(() => verifier.verify(body, timestamp, eventId, `sha256=${signature}`)).not.toThrow();
  });

  it('refuse une signature invalide et un événement expiré', () => {
    const body = Buffer.from('{}');
    const timestamp = String(Math.floor(Date.now() / 1000));
    expect(() => verifier.verify(body, timestamp, 'evt-1', `sha256=${'0'.repeat(64)}`)).toThrow();
    expect(() => verifier.verify(body, '1', 'evt-1', `sha256=${'0'.repeat(64)}`)).toThrow();
  });
});
