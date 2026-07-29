"use client";

import { useTranslations } from "next-intl";
import { Check, ArrowRight } from "lucide-react";
import Button from "./ui/Button";
import { PLANS, type PlanKey } from "@/lib/stripe";

interface PricingCardsProps {
  onSelectPlan: (plan: PlanKey) => void;
  isLoading?: boolean;
}

export default function PricingCards({ onSelectPlan, isLoading }: PricingCardsProps) {
  const t = useTranslations("pricing");

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">{t("freePlan")}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">0€</span>
            <span className="text-gray-500">/mois</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">{t("freeDesc")}</p>
          <ul className="mt-6 space-y-3 flex-1">
            {["3 analyses gratuites", "1 logement", "Français uniquement", "Export texte"].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="w-full mt-6" disabled>
            {t("currentPlan")}
          </Button>
        </div>

        {/* Paid plans */}
        {(Object.keys(PLANS) as PlanKey[]).map((planKey, idx) => {
          const plan = PLANS[planKey];
          const isPopular = planKey === "pro";
          return (
            <div
              key={planKey}
              className={`relative rounded-2xl p-6 flex flex-col ${
                isPopular
                  ? "bg-brand-900 text-white border-2 border-brand-500"
                  : "bg-white border border-gray-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t("mostPopular")}
                  </span>
                </div>
              )}
              <h3 className={`text-lg font-semibold ${isPopular ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
                  {plan.price}€
                </span>
                <span className={isPopular ? "text-brand-200" : "text-gray-500"}>/mois</span>
              </div>
              <p className={`mt-2 text-sm ${isPopular ? "text-brand-200" : "text-gray-500"}`}>
                {planKey === "starter" ? t("starterDesc") : t("proDesc")}
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${isPopular ? "text-brand-100" : "text-gray-600"}`}>
                    <Check className={`w-4 h-4 ${isPopular ? "text-brand-300" : "text-green-500"}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => onSelectPlan(planKey)}
                isLoading={isLoading}
                variant={isPopular ? "primary" : "secondary"}
                className={`w-full mt-6 ${isPopular ? "bg-white text-brand-900 hover:bg-brand-50" : ""}`}
              >
                {t("subscribe")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
