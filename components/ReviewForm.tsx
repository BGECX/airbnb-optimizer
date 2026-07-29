"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "./ui/Button";
import { Sparkles, Trash2, Plus, FileText } from "lucide-react";
import type { ReviewInput } from "@/types";

interface ReviewFormProps {
  onSubmit: (reviews: ReviewInput[]) => void;
  isLoading: boolean;
}

export default function ReviewForm({ onSubmit, isLoading }: ReviewFormProps) {
  const t = useTranslations("form");
  const [reviews, setReviews] = useState<ReviewInput[]>([
    { id: 1, note: 5, texte: "" },
  ]);
  const [bulkText, setBulkText] = useState("");
  const [mode, setMode] = useState<"individual" | "bulk">("individual");

  function addReview() {
    setReviews([...reviews, { id: Date.now(), note: 5, texte: "" }]);
  }

  function removeReview(id: number) {
    setReviews(reviews.filter((r) => r.id !== id));
  }

  function updateReview(id: number, field: keyof ReviewInput, value: string | number) {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function parseBulk() {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const parsed: ReviewInput[] = lines.map((line, i) => {
      const match = line.match(/^([1-5])\s*[-:]\s*(.+)$/);
      if (match) {
        return { id: Date.now() + i, note: parseInt(match[1]), texte: match[2].trim() };
      }
      return { id: Date.now() + i, note: 5, texte: line.trim() };
    });
    setReviews(parsed);
    setMode("individual");
  }

  function handleSubmit() {
    const valid = reviews.filter((r) => r.texte.trim().length > 5);
    if (valid.length > 0) onSubmit(valid);
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode("individual")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "individual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("modeIndividual")}
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "bulk" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("modeBulk")}
        </button>
      </div>

      {mode === "bulk" ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium">{t("bulkHintTitle")}</p>
            <p className="mt-1">{t("bulkHintText")}</p>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={t("bulkPlaceholder")}
            className="w-full h-64 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y text-sm"
          />
          <Button onClick={parseBulk} variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            {t("parseBulk")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {t("review")} #{idx + 1}
                </span>
                {reviews.length > 1 && (
                  <button
                    onClick={() => removeReview(review.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t("rating")}</label>
                  <select
                    value={review.note}
                    onChange={(e) => updateReview(review.id, "note", parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}/5
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t("text")}</label>
                  <textarea
                    value={review.texte}
                    onChange={(e) => updateReview(review.id, "texte", e.target.value)}
                    placeholder={t("reviewPlaceholder")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 resize-y"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button onClick={addReview} variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("addReview")}
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isLoading ? t("analyzing") : t("analyzeButton")}
        </Button>
      </div>
    </div>
  );
}
