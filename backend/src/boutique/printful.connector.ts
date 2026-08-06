import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupplierQuote } from "./margin-engine";

@Injectable()
export class PrintfulConnector {
  constructor(private config: ConfigService) {}

  configured() {
    return Boolean(this.config.get<string>("PRINTFUL_API_TOKEN"));
  }

  async quote(input: {
    printfulVariantId?: number;
    quantity: number;
    country: string;
    postCode: string;
    city: string;
  }): Promise<SupplierQuote[]> {
    const token = this.config.get<string>("PRINTFUL_API_TOKEN");
    if (!token || !input.printfulVariantId) return [];
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const [variantResponse, shippingResponse] = await Promise.all([
        fetch(`https://api.printful.com/products/variant/${input.printfulVariantId}`, {
          headers,
          signal: controller.signal,
        }),
        fetch("https://api.printful.com/shipping/rates", {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            recipient: {
              country_code: input.country.toUpperCase(),
              zip: input.postCode,
              city: input.city,
            },
            items: [{ variant_id: input.printfulVariantId, quantity: input.quantity }],
            currency: "EUR",
          }),
        }),
      ]);
      if (!variantResponse.ok || !shippingResponse.ok) {
        throw new ServiceUnavailableException(
          `Printful a refusé le devis (${variantResponse.status}/${shippingResponse.status})`,
        );
      }
      const variantPayload = await variantResponse.json() as any;
      const shippingPayload = await shippingResponse.json() as any;
      const unitPrice = Number(
        variantPayload?.result?.variant?.price ?? variantPayload?.result?.variant?.retail_price ?? 0,
      );
      return (shippingPayload?.result ?? []).map((rate: any) => ({
        provider: "PRINTFUL",
        quoteId: `PRINTFUL:${input.printfulVariantId}:${rate.id}`,
        productCostHt: unitPrice * input.quantity,
        shippingCostHt: Number(rate.rate ?? 0),
        taxCost: 0,
        minDeliveryDays: Number(rate.minDeliveryDays ?? 0),
        maxDeliveryDays: Number(rate.maxDeliveryDays ?? 0),
        qualityScore: 88,
        neutralPackaging: true,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        live: true,
      }));
    } finally {
      clearTimeout(timeout);
    }
  }
}
