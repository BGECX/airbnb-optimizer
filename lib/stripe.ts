import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// IDs des produits/prix Stripe (à créer dans le Dashboard Stripe)
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_starter_placeholder",
  pro: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
};

export type PlanKey = "starter" | "pro";

export const PLANS: Record<PlanKey, { name: string; price: number; priceId: string; features: string[] }> = {
  starter: {
    name: "Starter",
    price: 29,
    priceId: STRIPE_PRICE_IDS.starter,
    features: [
      "Analyses illimitées",
      "Jusqu'à 5 logements",
      "Descriptions en 10 langues",
      "Support par email",
      "Export PDF",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    priceId: STRIPE_PRICE_IDS.pro,
    features: [
      "Analyses illimitées",
      "Logements illimités",
      "50 langues",
      "Support prioritaire",
      "Export PDF + API",
      "White-label",
      "Account manager",
    ],
  },
};
