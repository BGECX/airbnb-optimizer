import { getSupabase } from "./supabase";

export interface AnalysisRecord {
  id?: string;
  user_id: string;
  reviews_json: any;
  diagnostic_json: any;
  optimized_json: any;
  note_moyenne: number;
  langue: string;
}

export interface SubscriptionRecord {
  id?: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: "starter" | "pro";
  status: "active" | "canceled" | "past_due" | "unpaid";
  current_period_end?: string;
}

// ─── Analyses ───

export async function saveAnalysis(record: AnalysisRecord) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("analyses")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserAnalyses(userId: string, limit = 10) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ─── Subscriptions ───

export async function upsertSubscription(record: SubscriptionRecord) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(record, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSubscription(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data;
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  updates: Partial<SubscriptionRecord>
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
