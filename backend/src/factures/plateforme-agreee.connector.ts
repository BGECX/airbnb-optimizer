import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PaSubmission {
  transmissionId: string;
  format: string;
  payloadHash: string;
  payload: unknown;
}

export interface PaSubmissionResult {
  provider: string;
  externalId: string;
  receipt: unknown;
  httpStatus: number;
}

@Injectable()
export class PlateformeAgreeeConnector {
  constructor(private readonly config: ConfigService) {}

  async submit(input: PaSubmission): Promise<PaSubmissionResult> {
    const endpoint = this.config.get<string>('PA_SUBMIT_URL');
    const apiKey = this.config.get<string>('PA_API_KEY');
    const provider = this.config.get<string>('PA_PROVIDER_NAME');
    if (!endpoint || !apiKey || !provider) {
      throw new ServiceUnavailableException('Aucune plateforme agréée réelle n’est configurée');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'idempotency-key': input.transmissionId,
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const raw = await response.text();
      if (raw.length > 1_000_000) throw new Error('Réponse de plateforme trop volumineuse');
      let receipt: unknown = {};
      try { receipt = raw ? JSON.parse(raw) : {}; } catch { receipt = { message: raw.slice(0, 2_000) }; }
      if (!response.ok) throw new Error(`Plateforme HTTP ${response.status}`);
      const externalId = this.readExternalId(receipt);
      if (!externalId) throw new Error('La plateforme n’a retourné aucun identifiant externe');
      return { provider, externalId, receipt, httpStatus: response.status };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      const message = error instanceof Error && error.name === 'AbortError' ? 'Délai de réponse de la plateforme dépassé' : (error as Error).message;
      throw new ServiceUnavailableException(message);
    } finally {
      clearTimeout(timeout);
    }
  }

  private readExternalId(receipt: unknown) {
    if (!receipt || typeof receipt !== 'object') return undefined;
    const record = receipt as Record<string, unknown>;
    const value = record.externalId ?? record.id ?? record.transmissionId;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
