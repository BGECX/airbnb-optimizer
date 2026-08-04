export type QuoteStrategy = "BEST_MARGIN" | "BALANCED" | "FASTEST";

export interface SupplierQuote {
  provider: string;
  quoteId: string;
  productCostHt: number;
  shippingCostHt: number;
  taxCost: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  qualityScore: number;
  neutralPackaging: boolean;
  expiresAt: string;
  live: boolean;
}

export interface RankedQuote extends SupplierQuote {
  totalSupplierCost: number;
  paymentFees: number;
  savReserve: number;
  netMargin: number;
  marginRate: number;
  score: number;
  eligible: boolean;
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function rankSupplierQuotes(input: {
  salePriceHt: number;
  paymentFeeRate: number;
  paymentFeeFixed: number;
  savReserveRate: number;
  minimumMarginRate: number;
  strategy: QuoteStrategy;
  quotes: SupplierQuote[];
}): RankedQuote[] {
  const paymentFees = money(input.salePriceHt * input.paymentFeeRate + input.paymentFeeFixed);
  const savReserve = money(input.salePriceHt * input.savReserveRate);

  return input.quotes
    .map((quote) => {
      const totalSupplierCost = money(quote.productCostHt + quote.shippingCostHt + quote.taxCost);
      const netMargin = money(input.salePriceHt - totalSupplierCost - paymentFees - savReserve);
      const marginRate = input.salePriceHt > 0 ? netMargin / input.salePriceHt : 0;
      const speedScore = Math.max(0, 100 - quote.maxDeliveryDays * 8);
      const marginScore = Math.max(0, Math.min(100, marginRate * 200));
      const packagingScore = quote.neutralPackaging ? 100 : 25;
      const score = input.strategy === "BEST_MARGIN"
        ? marginScore * 0.75 + quote.qualityScore * 0.15 + speedScore * 0.05 + packagingScore * 0.05
        : input.strategy === "FASTEST"
          ? speedScore * 0.65 + quote.qualityScore * 0.15 + marginScore * 0.15 + packagingScore * 0.05
          : marginScore * 0.4 + quote.qualityScore * 0.3 + speedScore * 0.2 + packagingScore * 0.1;

      return {
        ...quote,
        totalSupplierCost,
        paymentFees,
        savReserve,
        netMargin,
        marginRate: money(marginRate * 100),
        score: money(score),
        eligible: marginRate >= input.minimumMarginRate,
      };
    })
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
}
