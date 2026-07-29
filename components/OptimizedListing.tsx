"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import Badge from "./ui/Badge";
import { Copy, Check, FileText, Lightbulb, Wrench } from "lucide-react";
import { useState } from "react";
import type { OptimizedListing as OptimizedListingType } from "@/types";

interface Props {
  optimized: OptimizedListingType;
}

export default function OptimizedListing({ optimized }: Props) {
  const t = useTranslations("results");
  const [copied, setCopied] = useState(false);
  const listing = optimized.listing_optimise;
  const recos = optimized.recommandations_proprietaire;

  function copyToClipboard() {
    const text = `${listing.titre}\n\n${listing.description}\n\n${listing.bullets_points.join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="info" className="mb-3">{t("optimizedTitle")}</Badge>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{listing.titre}</h2>
              <p className="mt-2 text-brand-700 font-medium">{listing.accroche}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="shrink-0 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              title={t("copy")}
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-lg">
            <FileText className="w-5 h-5 text-brand-600" />
          </div>
          <CardTitle>{t("optimizedDescription")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {listing.description}
          </div>
        </CardContent>
      </Card>

      {/* Bullets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("keyAmenities")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {listing.bullets_points.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">✓</span>
                <span className="text-gray-700">{bullet}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Mots-clés SEO */}
      <div className="flex flex-wrap gap-2">
        {listing.mots_cles_seo.map((kw, i) => (
          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            #{kw}
          </span>
        ))}
      </div>

      {/* Recommandations */}
      {recos.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <CardTitle className="text-amber-800">{t("recommendations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recos.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{rec.action}</p>
                      <Badge
                        variant={rec.impact === "Fort" ? "danger" : rec.impact === "Moyen" ? "warning" : "default"}
                        className="text-[10px]"
                      >
                        {rec.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
