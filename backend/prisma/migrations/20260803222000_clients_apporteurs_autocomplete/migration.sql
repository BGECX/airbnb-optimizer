CREATE TYPE "ApporteurType" AS ENUM ('AGENCE_IMMOBILIERE', 'APPORTEUR_AFFAIRES', 'ARCHITECTE', 'MAITRE_OEUVRE', 'SYNDIC', 'AUTRE');

CREATE TABLE "apporteurs_affaires" (
  "id" TEXT NOT NULL,
  "type" "ApporteurType" NOT NULL DEFAULT 'AUTRE',
  "nom" TEXT NOT NULL,
  "siret" TEXT,
  "adresse" TEXT,
  "code_postal" TEXT,
  "ville" TEXT,
  "telephone" TEXT,
  "email" TEXT,
  "contact_nom" TEXT,
  "reference_mandat" TEXT,
  "commission_pct" DECIMAL(5,2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "apporteurs_affaires_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clients_siret_key" ON "clients"("siret");
CREATE UNIQUE INDEX "apporteurs_affaires_siret_key" ON "apporteurs_affaires"("siret");

ALTER TABLE "devis" ADD COLUMN "apporteur_id" TEXT;
ALTER TABLE "devis" ADD COLUMN "reference_mandat" TEXT;
ALTER TABLE "devis" ADD CONSTRAINT "devis_apporteur_id_fkey" FOREIGN KEY ("apporteur_id") REFERENCES "apporteurs_affaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
