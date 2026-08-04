import { rankSupplierQuotes } from "./margin-engine";

describe("rankSupplierQuotes", () => {
  const quotes = [
    { provider: "A", quoteId: "a", productCostHt: 18, shippingCostHt: 6, taxCost: 0, minDeliveryDays: 3, maxDeliveryDays: 5, qualityScore: 80, neutralPackaging: true, expiresAt: "2026-08-05T00:00:00Z", live: true },
    { provider: "B", quoteId: "b", productCostHt: 22, shippingCostHt: 4, taxCost: 0, minDeliveryDays: 1, maxDeliveryDays: 2, qualityScore: 92, neutralPackaging: true, expiresAt: "2026-08-05T00:00:00Z", live: true },
  ];

  it("selects the most profitable quote for BEST_MARGIN", () => {
    const ranked = rankSupplierQuotes({ salePriceHt: 50, paymentFeeRate: 0.015, paymentFeeFixed: 0.25, savReserveRate: 0.02, minimumMarginRate: 0.2, strategy: "BEST_MARGIN", quotes });
    expect(ranked[0].provider).toBe("A");
    expect(ranked[0].netMargin).toBe(24);
  });

  it("selects the fastest quote for FASTEST", () => {
    const ranked = rankSupplierQuotes({ salePriceHt: 50, paymentFeeRate: 0, paymentFeeFixed: 0, savReserveRate: 0, minimumMarginRate: 0.2, strategy: "FASTEST", quotes });
    expect(ranked[0].provider).toBe("B");
  });
});
