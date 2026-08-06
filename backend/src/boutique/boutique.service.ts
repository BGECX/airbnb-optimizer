import { Injectable } from "@nestjs/common";
import { CompareSupplierQuotesDto } from "./dto";
import { GelatoConnector } from "./gelato.connector";
import { rankSupplierQuotes } from "./margin-engine";
import { PrintfulConnector } from "./printful.connector";

@Injectable()
export class BoutiqueService {
  constructor(private gelato: GelatoConnector, private printful: PrintfulConnector) {}

  status() {
    return {
      ready: this.gelato.configured() || this.printful.configured(),
      providers: [
        { code: "GELATO", status: this.gelato.configured() ? "ACTIVE" : "MISSING_CREDENTIALS", liveQuotes: true },
        { code: "CIMPRESS", status: "CONTRACT_REQUIRED", liveQuotes: false },
        { code: "PRINTFUL", status: this.printful.configured() ? "ACTIVE" : "MISSING_CREDENTIALS", liveQuotes: true },
        { code: "PRINTIFY", status: "PLANNED", liveQuotes: false },
      ],
    };
  }

  catalog() {
    return [
      { code: "BUSINESS_CARDS", name: "Cartes de visite", family: "IMPRESSION", providerMappingRequired: true },
      { code: "FLYERS", name: "Flyers et dépliants", family: "IMPRESSION", providerMappingRequired: true },
      { code: "SITE_SIGNS", name: "Panneaux de chantier", family: "SIGNAGE", providerMappingRequired: true },
      { code: "SCAFFOLD_BANNERS", name: "Bâches d’échafaudage", family: "SIGNAGE", providerMappingRequired: true },
      { code: "MAGNETIC_VEHICLE_SIGNS", name: "Panneaux magnétiques véhicule", family: "SIGNAGE", providerMappingRequired: true },
      { code: "WORKWEAR", name: "Vêtements professionnels", family: "TEXTILE", providerMappingRequired: true },
    ];
  }

  async compare(dto: CompareSupplierQuotesDto) {
    const results = await Promise.allSettled([
      this.gelato.quote(dto),
      this.printful.quote(dto),
    ]);
    const quotes = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
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
