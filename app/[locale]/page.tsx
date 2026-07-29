"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles, BarChart3, Globe, Crown, Zap, History } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import LangSwitcher from "@/components/LangSwitcher";
import AuthButtons from "@/components/AuthButtons";
import ReviewForm from "@/components/ReviewForm";
import ResultsPanel from "@/components/ResultsPanel";
import PaywallModal from "@/components/PaywallModal";
import PricingCards from "@/components/PricingCards";
import { useAnalysisQuota } from "@/hooks/useAnalysisQuota";
import type { ReviewInput, ApiResponse, PlanKey } from "@/types";

export default function HomePage() {
  const t = useTranslations("home");
  const tq = useTranslations("quota");
  const locale = useLocale();
  const { isSignedIn, user } = useUser();

  const quota = useAnalysisQuota();
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  // Charger l'historique si connecté
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/analyses/history")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setRecentAnalyses(data.analyses || []);
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  async function handleAnalyze(reviews: ReviewInput[]) {
    if (quota.hasReachedLimit && !isSignedIn) {
      setIsPaywallOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews, langue: locale }),
      });
      const data: ApiResponse = await res.json();

      if (data.success) {
        quota.increment();
        // Ajouter au historique local
        if (isSignedIn) {
          setRecentAnalyses((prev) => [
            { id: Date.now(), created_at: new Date().toISOString(), note_moyenne: data.optimized.meta.note_moyenne_source },
            ...prev,
          ]);
        }
      }

      setResult(data);
    } catch (err) {
      setResult({ success: false, diagnostic: {} as any, optimized: {} as any, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubscribe(plan: PlanKey) {
    if (!isSignedIn) {
      // Rediriger vers la modale de connexion Clerk
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale, returnUrl: window.location.origin }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session de paiement");
      }
    } catch (err) {
      alert("Erreur de connexion");
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  const quotaDisplay = quota.isSubscribed
    ? tq("unlimited")
    : tq("remaining", { count: Math.max(0, 3 - quota.analysesUsed) });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Kritia</h1>
              <p className="text-xs text-gray-500 mt-0.5">{t("tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quota badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              quota.isSubscribed
                ? "bg-amber-100 text-amber-800"
                : quota.hasReachedLimit
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              {quota.isSubscribed ? <Crown className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              {quotaDisplay}
            </div>
            <LangSwitcher />
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {t("heroTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <BarChart3 className="w-4 h-4" />
                {t("badgeNLP")}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Globe className="w-4 h-4" />
                {t("badge50Lang")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel : Form + Historique */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("formTitle")}</h3>
              <p className="text-sm text-gray-500 mb-6">{t("formSubtitle")}</p>

              {!isSignedIn && quota.analysesUsed > 0 && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  quota.hasReachedLimit
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  <p className="font-medium">{quotaDisplay}</p>
                  {quota.hasReachedLimit && (
                    <button
                      onClick={() => setIsPaywallOpen(true)}
                      className="mt-1 text-brand-600 hover:text-brand-700 font-semibold underline"
                    >
                      {tq("upgrade")}
                    </button>
                  )}
                </div>
              )}

              <ReviewForm onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>

            {/* Historique des analyses (connecté uniquement) */}
            {isSignedIn && recentAnalyses.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Historique</h3>
                </div>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 5).map((ana) => (
                    <div key={ana.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">
                        {new Date(ana.created_at).toLocaleDateString(locale)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {ana.note_moyenne}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel : Results */}
          <div className="lg:col-span-7">
            {result ? (
              <ResultsPanel data={result} />
            ) : showPricing ? (
              <PricingCards
                onSelectPlan={(plan) => {
                  if (!isSignedIn) {
                    // Clerk modal s'ouvre automatiquement via SignInButton
                    setIsPaywallOpen(true);
                    return;
                  }
                  handleSubscribe(plan);
                }}
                isLoading={isCheckoutLoading}
              />
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t("emptyStateTitle")}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{t("emptyStateText")}</p>
                <button
                  onClick={() => setShowPricing(true)}
                  className="mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  Voir les formules d'abonnement →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Kritia</p>
          <p className="text-xs text-gray-400">{t("footerNote")}</p>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSubscribe={handleSubscribe}
        isLoading={isCheckoutLoading}
      />
    </div>
  );
}
