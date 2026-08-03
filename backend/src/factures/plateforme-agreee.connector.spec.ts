import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlateformeAgreeeConnector } from './plateforme-agreee.connector';

describe('PlateformeAgreeeConnector', () => {
  it('refuse tout faux envoi sans fournisseur réel configuré', async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const connector = new PlateformeAgreeeConnector(config);
    await expect(connector.submit({ transmissionId: 't-1', format: 'FACTUR_X', payloadHash: 'hash', payload: {} }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
