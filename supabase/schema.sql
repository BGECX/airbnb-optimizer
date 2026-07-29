-- ============================================================
-- Schema Supabase — Airbnb Optimizer
-- Exécuter dans l'éditeur SQL de Supabase (supabase.com)
-- ============================================================

-- Table : analyses
-- Stocke chaque analyse effectuée par un utilisateur
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  reviews_json JSONB NOT NULL,
  diagnostic_json JSONB NOT NULL,
  optimized_json JSONB NOT NULL,
  note_moyenne NUMERIC(3,1),
  langue TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes rapides par utilisateur
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Table : subscriptions
-- Stocke les abonnements Stripe liés aux utilisateurs Clerk
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('starter', 'pro')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS) — IMPORTANT pour la sécurité
-- ============================================================

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique : un utilisateur ne peut voir que SES analyses
CREATE POLICY "Users can only view their own analyses"
  ON analyses FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Politique : un utilisateur ne peut voir que SON abonnement
CREATE POLICY "Users can only view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Note : Les insertions depuis le webhook Stripe se font via la Service Role Key
-- (côté serveur Next.js), donc elles bypassent RLS.
