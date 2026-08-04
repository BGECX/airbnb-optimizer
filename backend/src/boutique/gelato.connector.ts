import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupplierQuote } from "./margin-engine";

@Injectable()
export class GelatoConnector {
  constructor(private config: ConfigService) {}

  configured() { return Boolean(this.config.get<string>("GELATO_API_KEY")); }

  async quote(input: { productUid: string; quantity: number; country: string; postCode: string; city: string }): Promise<SupplierQuote[]> {
    const apiKey = this.config.get<string>("GELATO_API_KEY");
    if (!apiKey) return [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch("https://order.gelatoapis.com/v4/orders:quote", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          orderReferenceId: `kritia-quote-${Date.now()}`,
          customerReferenceId: "kritia-shop",
          currency: "EUR",
          allowMultipleQuotes: true,
          recipient: { country: input.country.toUpperCase(), firstName: "Client", lastName: "KRITIA", addressLine1: "Adresse à confirmer", city: input.city, postCode: input.postCode, email: "commandes@getkritia.com", phone: "+33100000000" },
          products: [{ itemReferenceId: "item-1", productUid: input.productUid, quantity: input.quantity }],
        }),
      });
      if (!response.ok) throw new ServiceUnavailableException(`Gelato a refusé le devis (${response.status})`);
      const data = await response.json() as any;
      return (data.quotes || []).flatMap((quote: any) => (quote.shipmentMethods || []).map((shipment: any) => ({
        provider: "GELATO",
        quoteId: `${quote.id}:${shipment.shipmentMethodUid}`,
        productCostHt: (quote.products || []).reduce((sum: number, product: any) => sum + Number(product.price || 0), 0),
        shippingCostHt: Number(shipment.price || 0),
        taxCost: 0,
        minDeliveryDays: Number(shipment.minDeliveryDays || 0),
        maxDeliveryDays: Number(shipment.maxDeliveryDays || 0),
        qualityScore: 85,
        neutralPackaging: true,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        live: true,
      })));
    } finally { clearTimeout(timeout); }
  }
}
