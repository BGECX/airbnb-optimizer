import { Injectable } from "@nestjs/common";
import { CompareSupplierQuotesDto } from "./dto";
import { GelatoConnector } from "./gelato.connector";
import { rankSupplierQuotes } from "./margin-engine";

@Injectable()
export class BoutiqueService {
  constructor(private gelato: GelatoConnector) {}

  status() {
    return {
      ready: this.gelato.configured(),
      providers: [
        { code: "GELATO", status: this.gelato.configured() ? "ACTIVE" : "MISSING_CREDENTIALS", liveQuotes: true },
        { code: "CIMPRESS", status: "CONTRACT_REQUIRED", liveQuotes: false },
        { code: "PRINTFUL", status: "PLANNED", liveQuotes: false },
        { code: "PRINTIFY", status: "PLANNED", liveQuotes: false },
      ],
    };
  }

  catalog() {
    return [
      { code: "BUSINESS_CARDS", name: "Cartes de visite", providerMappingRequired: true },
      { code: "FLYERS", name: "Flyers", providerMappingRequired: true },
      { code: "SITE_SIGNS", name: "Panneaux de chantier", providerMappingRequired: true },
      { code: "WORKWEAR", name: "Vêtements professionnels", providerMappingRequired: true },
      { code: "VEHICLE_MARKING", name: "Marquage véhicule", providerMappingRequired: true },
    ];
  }

  async compare(dto: CompareSupplierQuotesDto) {
    const quotes = await this.gelato.quote(dto);
    const ranked = rankSupplierQuotes({
      salePriceHt: dto.salePriceHt,
      paymentFeeRate: 0.015,
      paymentFeeFixed: 0.25,
      savReserveRate: 0.02,
      minimumMarginRate: 0.2,
      strategy: dto.strategy || "BALANCED",
      quotes,
    });
    return {
      strategy: dto.strategy || "BALANCED",
      currency: "EUR",
      selected: ranked.find((quote) => quote.eligible) || null,
      quotes: ranked,
      warning: quotes.length ? null : "Aucun fournisseur temps réel n'est configuré ou disponible.",
    };
  }
}
