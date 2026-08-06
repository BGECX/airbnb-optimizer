ALTER TABLE "users"
  ADD COLUMN "account_type" TEXT NOT NULL DEFAULT 'ERP_TRIAL',
  ALTER COLUMN "trial_started_at" DROP NOT NULL,
  ALTER COLUMN "trial_ends_at" DROP NOT NULL;
