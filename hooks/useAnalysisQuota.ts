"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "airbnb_optimizer_quota";
const FREE_LIMIT = 3;

export interface QuotaState {
  analysesUsed: number;
  analysesRemaining: number;
  hasReachedLimit: boolean;
  isSubscribed: boolean;
  increment: () => void;
  reset: () => void;
}

export function useAnalysisQuota(): QuotaState {
  const [analysesUsed, setAnalysesUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnalysesUsed(data.analysesUsed || 0);
        setIsSubscribed(data.isSubscribed || false);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const save = useCallback((used: number, sub: boolean) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analysesUsed: used, isSubscribed: sub }));
  }, []);

  const increment = useCallback(() => {
    if (isSubscribed) return;
    const newCount = analysesUsed + 1;
    setAnalysesUsed(newCount);
    save(newCount, false);
  }, [analysesUsed, isSubscribed, save]);

  const reset = useCallback(() => {
    setAnalysesUsed(0);
    setIsSubscribed(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const analysesRemaining = isSubscribed ? Infinity : Math.max(0, FREE_LIMIT - analysesUsed);
  const hasReachedLimit = !isSubscribed && analysesUsed >= FREE_LIMIT;

  return {
    analysesUsed,
    analysesRemaining,
    hasReachedLimit,
    isSubscribed,
    increment,
    reset,
  };
}
