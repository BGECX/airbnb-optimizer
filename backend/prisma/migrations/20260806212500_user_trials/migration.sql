ALTER TABLE "users"
  ADD COLUMN "subscription_status" TEXT NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN "trial_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "trial_ends_at" TIMESTAMP(3);

UPDATE "users"
SET "trial_ends_at" = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE "trial_ends_at" IS NULL;

ALTER TABLE "users"
  ALTER COLUMN "trial_ends_at" SET NOT NULL;
