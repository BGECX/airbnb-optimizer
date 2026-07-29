"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import Badge from "./ui/Badge";
import { ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Quote } from "lucide-react";
import type { DiagnosticData } from "@/types";

interface Props {
  diagnostic: DiagnosticData;
}

export default function DiagnosticCards({ diagnostic }: Props) {
  const t = useTranslations("results");
  const s = diagnostic.synthese_globale;

  const score = s.nb_avis_analyses > 0
    ? Math.round((s.top_points_forts.reduce((a, b) => a + b.mentions, 0) /
        (s.top_points_forts.reduce((a, b) => a + b.mentions, 0) + s.top_points_faibles.reduce((a, b) => a + b.mentions, 0) + 1)) * 100)
    : 50;

  return (
    <div className="space-y-6">
      {/* Score global */}
      <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle
              cx="48" cy="48" r="40"
              stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${score * 2.51} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{score}</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t("healthScore")}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {s.nb_avis_analyses} {t("reviewsAnalyzed")}
          </p>
          <p className="text-sm font-medium mt-2 text-gray-700">
            {s.recommandation_prioritaire}
          </p>
        </div>
      </div>

      {/* Points forts */}
      {s.top_points_forts.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-green-800">{t("strengths")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.top_points_forts.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge variant="success">{item.mentions}×</Badge>
                  <div>
                    <p className="font-medium text-gray-900">{item.theme}</p>
                    <p className="text-sm text-gray-500">{t("mentionedPositively")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points faibles */}
      {s.top_points_faibles.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ThumbsDown className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle className="text-red-800">{t("weaknesses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.top_points_faibles.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge variant="danger">{item.mentions}×</Badge>
                  <div>
                    <p className="font-medium text-gray-900">{item.theme}</p>
                    <p className="text-sm text-gray-500">{t("mentionedNegatively")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thèmes récurrents */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <CardTitle>{t("recurringThemes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {s.themes_recurrents.slice(0, 8).map((theme, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-700">{theme.theme}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600 font-medium">+{theme.mentions_pos}</span>
                  <span className="text-xs text-red-500 font-medium">-{theme.mentions_neg}</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${theme.score_net >= 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(Math.abs(theme.score_net) * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
