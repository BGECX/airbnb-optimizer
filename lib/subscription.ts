import { cookies } from "next/headers";

const SUBSCRIPTION_COOKIE = "airbnb_optimizer_sub";
const FREE_LIMIT = 3;

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: "free" | "starter" | "pro";
  analysesUsed: number;
  analysesRemaining: number;
  hasReachedLimit: boolean;
}

export function getSubscriptionStatus(): SubscriptionStatus {
  const cookieStore = cookies();
  const subCookie = cookieStore.get(SUBSCRIPTION_COOKIE);

  let analysesUsed = 0;
  let isSubscribed = false;
  let plan: "free" | "starter" | "pro" = "free";

  if (subCookie) {
    try {
      const data = JSON.parse(subCookie.value);
      analysesUsed = data.analysesUsed || 0;
      isSubscribed = data.isSubscribed || false;
      plan = data.plan || "free";
    } catch {
      // Cookie corrompu, on reset
    }
  }

  const analysesRemaining = isSubscribed ? Infinity : Math.max(0, FREE_LIMIT - analysesUsed);

  return {
    isSubscribed,
    plan,
    analysesUsed,
    analysesRemaining,
    hasReachedLimit: !isSubscribed && analysesUsed >= FREE_LIMIT,
  };
}

export function incrementAnalysisCount(): void {
  const cookieStore = cookies();
  const subCookie = cookieStore.get(SUBSCRIPTION_COOKIE);

  let data = { analysesUsed: 0, isSubscribed: false, plan: "free" };
  if (subCookie) {
    try {
      data = JSON.parse(subCookie.value);
    } catch {
      // ignore
    }
  }

  data.analysesUsed = (data.analysesUsed || 0) + 1;

  cookieStore.set(SUBSCRIPTION_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 an
    path: "/",
  });
}

export function setSubscription(plan: "starter" | "pro"): void {
  const cookieStore = cookies();

  cookieStore.set(SUBSCRIPTION_COOKIE, JSON.stringify({
    analysesUsed: 0,
    isSubscribed: true,
    plan,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
