"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Sparkles, Lock, Zap, Check, Loader2 } from "lucide-react";
import Button from "./ui/Button";
import { PLANS, type PlanKey } from "@/lib/stripe";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: PlanKey) => void;
  isLoading?: boolean;
}

export default function PaywallModal({ isOpen, onClose, onSubscribe, isLoading }: PaywallModalProps) {
  const t = useTranslations("paywall");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("starter");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t("title")}</h2>
              <p className="text-sm text-gray-500">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Social proof */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              <span className="font-semibold">{t("socialProof")}</span> {t("socialProofDetail")}
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(PLANS) as PlanKey[]).map((planKey) => {
              const plan = PLANS[planKey];
              const isSelected = selectedPlan === planKey;
              return (
                <button
                  key={planKey}
                  onClick={() => setSelectedPlan(planKey)}
                  className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => onSubscribe(selectedPlan)}
              isLoading={isLoading}
              size="lg"
              className="w-full"
            >
              <Lock className="w-5 h-5 mr-2" />
              {t("ctaButton", { plan: PLANS[selectedPlan].name, price: PLANS[selectedPlan].price })}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
              {t("guarantee")} · {t("cancelAnytime")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
