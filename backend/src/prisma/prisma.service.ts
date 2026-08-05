import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    await this.ensureLogoCreditSchema();
    console.log('✅ Connected to PostgreSQL via Prisma');
  }

  async logoCreditSchemaReady() {
    const rows = await this.$queryRaw<Array<{ ready: boolean }>>`
      SELECT to_regclass('public.logo_credit_accounts') IS NOT NULL
        AND to_regclass('public.logo_credit_transactions') IS NOT NULL
        AND to_regclass('public.logo_generations') IS NOT NULL AS ready
    `;
    return Boolean(rows[0]?.ready);
  }

  private async ensureLogoCreditSchema() {
    await this.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "LogoCreditTransactionType" AS ENUM ('WELCOME', 'SUBSCRIPTION', 'PURCHASE', 'GENERATION', 'REFUND', 'ADMIN_ADJUSTMENT');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await this.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "LogoGenerationStatus" AS ENUM ('RESERVED', 'COMPLETED', 'FAILED', 'REFUNDED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "logo_credit_accounts" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "balance" INTEGER NOT NULL DEFAULT 3,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "logo_credit_accounts_pkey" PRIMARY KEY ("id")
      )
    `);
    await this.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "logo_credit_accounts_user_id_key" ON "logo_credit_accounts"("user_id")`);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "logo_credit_transactions" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "type" "LogoCreditTransactionType" NOT NULL,
        "reference" TEXT,
        "description" TEXT,
        "balance_after" INTEGER NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "logo_credit_transactions_pkey" PRIMARY KEY ("id")
      )
    `);
    await this.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "logo_credit_transactions_reference_key" ON "logo_credit_transactions"("reference")`);
    await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "logo_credit_transactions_user_id_created_at_idx" ON "logo_credit_transactions"("user_id", "created_at")`);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "logo_generations" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "prompt_digest" TEXT NOT NULL,
        "status" "LogoGenerationStatus" NOT NULL DEFAULT 'RESERVED',
        "credit_cost" INTEGER NOT NULL DEFAULT 1,
        "error_code" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completed_at" TIMESTAMP(3),
        CONSTRAINT "logo_generations_pkey" PRIMARY KEY ("id")
      )
    `);
    await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "logo_generations_user_id_created_at_idx" ON "logo_generations"("user_id", "created_at")`);
    await this.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "logo_credit_accounts" ADD CONSTRAINT "logo_credit_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await this.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "logo_credit_transactions" ADD CONSTRAINT "logo_credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await this.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "logo_generations" ADD CONSTRAINT "logo_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Disconnected from PostgreSQL');
  }
}
