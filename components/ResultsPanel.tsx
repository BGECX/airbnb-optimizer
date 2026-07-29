"use client";

import { useTranslations } from "next-intl";
import DiagnosticCards from "./DiagnosticCards";
import OptimizedListing from "./OptimizedListing";
import type { ApiResponse } from "@/types";

interface Props {
  data: ApiResponse;
}

export default function ResultsPanel({ data }: Props) {
  const t = useTranslations("results");

  if (!data.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{t("error")}</p>
        <p className="text-red-600 text-sm mt-1">{data.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t("resultsTitle")}</h2>
        <span className="text-sm text-gray-500">
          {data.optimized.meta.note_moyenne_source}/5 · {data.optimized.meta.nb_avis_source} {t("reviews")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {t("diagnosticTab")}
          </h3>
          <DiagnosticCards diagnostic={data.diagnostic} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {t("listingTab")}
          </h3>
          <OptimizedListing optimized={data.optimized} />
        </div>
      </div>
    </div>
  );
}
