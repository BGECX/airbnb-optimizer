-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'CHEF_CHANTIER', 'COMPTABLE', 'COMPAGNON', 'USER');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PARTICULIER', 'ENTREPRISE', 'COPROPRIETE', 'COLLECTIVITE');

-- CreateEnum
CREATE TYPE "ProspectStatut" AS ENUM ('PREMIER_CONTACT', 'VISITE_PLANIFIEE', 'VISITE_REALISEE', 'CHIFFRAGE', 'DEVIS_DEMANDE', 'DEVIS_ENVOYE', 'NEGOCIATION', 'GAGNE', 'PERDU');

-- CreateEnum
CREATE TYPE "ChantierStatut" AS ENUM ('PREPARATION', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'LIVRE', 'ANNULE');

-- CreateEnum
CREATE TYPE "VisiteStatut" AS ENUM ('PLANIFIEE', 'REALISEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "ElementBati" AS ENUM ('FONDATIONS', 'MURS_PIERRE', 'MACONNERIE', 'ENDUITS_CHAUX', 'CHARPENTE', 'PLANCHER', 'COUVERTURE', 'FACADE', 'MENUISERIE', 'HUMIDITE', 'RESEAUX', 'AUTRE');

-- CreateEnum
CREATE TYPE "GraviteDiagnostic" AS ENUM ('MINEURE', 'MODEREE', 'IMPORTANTE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "AleaCategorie" AS ENUM ('STRUCTURE', 'HUMIDITE', 'MATERIAUX_REEMPLOI', 'RESEAUX', 'AMIANTE_PLOMB', 'ACCES', 'METEO', 'ADMINISTRATIF', 'AUTRE');

-- CreateEnum
CREATE TYPE "AleaStatut" AS ENUM ('IDENTIFIE', 'ANALYSE', 'TRAITE', 'ACCEPTE', 'CLOTURE');

-- CreateEnum
CREATE TYPE "TravailConservatoireStatut" AS ENUM ('A_FAIRE', 'EN_COURS', 'REALISE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TraceBatiType" AS ENUM ('CONSTAT', 'SONDAGE', 'DEPOSE', 'DECOUVERTE', 'MODIFICATION', 'CONSERVATION', 'REEMPLOI');

-- CreateEnum
CREATE TYPE "DevisStatut" AS ENUM ('BROUILLON', 'ENVOYE', 'RELANCE', 'ACCEPTE', 'REFUSE', 'TRANSFORME', 'EXPIRE');

-- CreateEnum
CREATE TYPE "DpgfStatut" AS ENUM ('BROUILLON', 'VALIDE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "PosteDpgfType" AS ENUM ('BASE', 'OPTION', 'VARIANTE');

-- CreateEnum
CREATE TYPE "CategorieOperation" AS ENUM ('BIEN', 'SERVICE', 'MIXTE');

-- CreateEnum
CREATE TYPE "FormatFactureElectronique" AS ENUM ('FACTUR_X', 'UBL', 'CII');

-- CreateEnum
CREATE TYPE "CanalTransmission" AS ENUM ('PLATEFORME_AGREEE', 'CHORUS_PRO', 'EXPORT_MANUEL');

-- CreateEnum
CREATE TYPE "TransmissionStatut" AS ENUM ('PREPAREE', 'EN_COURS', 'ENVOYEE', 'ACCEPTEE', 'REJETEE', 'ERREUR');

-- CreateEnum
CREATE TYPE "FactureType" AS ENUM ('DEFINITIVE', 'ACOMPTE', 'SITUATION', 'AVANCE');

-- CreateEnum
CREATE TYPE "FactureStatut" AS ENUM ('BROUILLON', 'ENVOYEE', 'PAYEE', 'IMPAYEE', 'EN_RETARD', 'LITIGE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "AcompteStatut" AS ENUM ('ATTENTE', 'PAYE', 'IMPAYE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "SituationStatut" AS ENUM ('ETABLIE', 'ENVOYEE', 'PAYEE', 'IMPAYEE');

-- CreateEnum
CREATE TYPE "RetenueGarantieStatut" AS ENUM ('CONSTITUEE', 'CONSIGNEE', 'LIBERABLE', 'LIBEREE', 'LITIGE');

-- CreateEnum
CREATE TYPE "ReceptionStatut" AS ENUM ('SANS_RESERVE', 'AVEC_RESERVES', 'RESERVES_LEVEES', 'REFUSEE');

-- CreateEnum
CREATE TYPE "ReserveStatut" AS ENUM ('OUVERTE', 'EN_COURS', 'LEVEE', 'CONTESTEE');

-- CreateEnum
CREATE TYPE "SavStatut" AS ENUM ('OUVERT', 'QUALIFIE', 'PLANIFIE', 'EN_COURS', 'RESOLU', 'CLOTURE', 'REJETE');

-- CreateEnum
CREATE TYPE "AvoirStatut" AS ENUM ('EMIS', 'IMPUTE', 'ANNULE');

-- CreateEnum
CREATE TYPE "CommandeStatut" AS ENUM ('BROUILLON', 'VALIDEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "LivraisonStatut" AS ENUM ('EN_COURS', 'LIVREE', 'PARTIELLE', 'RETOURNEE');

-- CreateEnum
CREATE TYPE "FactureFournStatut" AS ENUM ('A_PAYER', 'PAYEE', 'EN_RETARD', 'ANNULEE');

-- CreateEnum
CREATE TYPE "CategorieCout" AS ENUM ('MATERIAUX', 'MAIN_OEUVRE', 'MATERIEL', 'SOUS_TRAITANCE', 'FRAIS_GENERAUX', 'ALEAS', 'AUTRE');

-- CreateEnum
CREATE TYPE "SourceDepense" AS ENUM ('SAISIE', 'COMMANDE', 'FACTURE_FOURNISSEUR', 'NOTE_FRAIS');

-- CreateEnum
CREATE TYPE "ContratType" AS ENUM ('CDI', 'CDD', 'APPRENTISSAGE', 'INTERIM', 'STAGE');

-- CreateEnum
CREATE TYPE "PointageType" AS ENUM ('TRAVAIL', 'HEURE_SUP', 'DEPLACEMENT', 'FORMATION');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');

-- CreateEnum
CREATE TYPE "BonStatut" AS ENUM ('EN_COURS', 'TRAITE', 'ANNULE');

-- CreateEnum
CREATE TYPE "PlanningType" AS ENUM ('TRAVAIL', 'CONGE', 'RTT', 'FORMATION', 'ARRET', 'DISPONIBLE');

-- CreateEnum
CREATE TYPE "PhotoPhase" AS ENUM ('AVANT', 'PENDANT', 'APRES', 'RESERVE', 'SAV');

-- CreateEnum
CREATE TYPE "DocumentChantierType" AS ENUM ('PLAN', 'PV', 'DOE', 'DIAGNOSTIC', 'DEVIS', 'FACTURE', 'BON_LIVRAISON', 'NOTICE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RessourceType" AS ENUM ('MATERIAU', 'MAIN_OEUVRE', 'MATERIEL', 'SOUS_TRAITANCE');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "DeclarationStatut" AS ENUM ('A_DECLARER', 'DECLAREE', 'PAYEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "LotSituation" AS ENUM ('OK', 'A_CONTROLER', 'TRAVAUX_EN_COURS', 'CONSIGNATION', 'NON_COMMENCE');

-- CreateEnum
CREATE TYPE "DiagnosticType" AS ENUM ('AMIANTE_DAPP', 'PLOMB_CREP', 'ELECTRICITE', 'GAZ', 'TERMITES', 'ERP_ACCESSIBILITE', 'LOI_CARREZ', 'ETAT_PARASITAIRE', 'DPE', 'ERNMT');

-- CreateEnum
CREATE TYPE "DiagnosticConclusion" AS ENUM ('CONFORME', 'NON_CONFORME', 'A_COMPLETER');

-- CreateEnum
CREATE TYPE "EvenementType" AS ENUM ('TRAVAUX', 'DIAGNOSTIC', 'SINISTRE', 'AG_COPRO', 'AUTRE');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('TEXT', 'VOCAL', 'PHOTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "replaced_by_id" TEXT,
    "user_agent" TEXT,
    "adresse_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "methode" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "statut_http" INTEGER NOT NULL,
    "adresse_ip" TEXT,
    "user_agent" TEXT,
    "champs" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres_entreprise" (
    "id" TEXT NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "siret" TEXT,
    "siren" TEXT,
    "tva_intra" TEXT,
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "site_web" TEXT,
    "logo_url" TEXT,
    "couleur_primary" TEXT NOT NULL DEFAULT '#2563eb',
    "couleur_secondary" TEXT NOT NULL DEFAULT '#f59e0b',
    "cgv" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametres_entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres_numerotation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prefixe" TEXT NOT NULL DEFAULT '',
    "numero_actuel" INTEGER NOT NULL DEFAULT 0,
    "format" TEXT NOT NULL DEFAULT '{PREFIX}{YYYY}-{NUMERO}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametres_numerotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres_tva" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "taux" DECIMAL(5,2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parametres_tva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres_banques" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "compte_comptable" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parametres_banques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assurances" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "police" TEXT NOT NULL,
    "compagnie" TEXT NOT NULL,
    "couverture" TEXT,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'PARTICULIER',
    "nom" TEXT NOT NULL,
    "siret" TEXT,
    "siren" TEXT,
    "tva_intra" TEXT,
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "contact_nom" TEXT,
    "contact_tel" TEXT,
    "contact_email" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "siret" TEXT,
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "specialite" TEXT,
    "delai_livraison" TEXT,
    "conditions_paiement" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sous_traitants" (
    "id" TEXT NOT NULL,
    "raison_sociale" TEXT NOT NULL,
    "siret" TEXT,
    "specialite" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "urssaf_date" TIMESTAMP(3),
    "urssaf_validite" TIMESTAMP(3),
    "urssaf_document_url" TEXT,
    "assurance_rc" TEXT,
    "assurance_rc_montant" DECIMAL(12,2),
    "decennale_date" TIMESTAMP(3),
    "decennale_validite" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sous_traitants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'PARTICULIER',
    "nom" TEXT NOT NULL,
    "contact_nom" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "projet" TEXT,
    "budget_estime" DECIMAL(12,2),
    "date_contact" TIMESTAMP(3) NOT NULL,
    "statut" "ProspectStatut" NOT NULL DEFAULT 'PREMIER_CONTACT',
    "notes" TEXT,
    "converted_to_client_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chantiers" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "date_debut_prevue" TIMESTAMP(3),
    "date_fin_prevue" TIMESTAMP(3),
    "date_debut_reelle" TIMESTAMP(3),
    "date_fin_reelle" TIMESTAMP(3),
    "montant_prevu" DECIMAL(12,2),
    "montant_realise" DECIMAL(12,2),
    "description" TEXT,
    "statut" "ChantierStatut" NOT NULL DEFAULT 'PREPARATION',
    "avancement" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "responsable_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visites_techniques" (
    "id" TEXT NOT NULL,
    "prospect_id" TEXT,
    "client_id" TEXT,
    "chantier_id" TEXT,
    "date_prevue" TIMESTAMP(3) NOT NULL,
    "date_realisee" TIMESTAMP(3),
    "statut" "VisiteStatut" NOT NULL DEFAULT 'PLANIFIEE',
    "adresse" TEXT,
    "objet" TEXT NOT NULL,
    "compte_rendu" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visites_techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostics_bati" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "visite_id" TEXT,
    "zone" TEXT NOT NULL,
    "element" "ElementBati" NOT NULL,
    "materiau" TEXT,
    "pathologie" TEXT NOT NULL,
    "gravite" "GraviteDiagnostic" NOT NULL DEFAULT 'MODEREE',
    "urgence" BOOLEAN NOT NULL DEFAULT false,
    "preconisations" TEXT,
    "etat_avant" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostics_bati_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aleas_chantiers" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "categorie" "AleaCategorie" NOT NULL,
    "description" TEXT NOT NULL,
    "probabilite" INTEGER NOT NULL DEFAULT 1,
    "impact" INTEGER NOT NULL DEFAULT 1,
    "statut" "AleaStatut" NOT NULL DEFAULT 'IDENTIFIE',
    "cout_estime" DECIMAL(12,2),
    "cout_reel" DECIMAL(12,2),
    "delai_jours_estime" INTEGER,
    "mesures" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "aleas_chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travaux_conservatoires" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "diagnostic_id" TEXT,
    "designation" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" "TravailConservatoireStatut" NOT NULL DEFAULT 'A_FAIRE',
    "date_prevue" TIMESTAMP(3),
    "date_realisee" TIMESTAMP(3),
    "cout_reel" DECIMAL(12,2),
    "observations" TEXT,

    CONSTRAINT "travaux_conservatoires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traces_bati" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "type" "TraceBatiType" NOT NULL,
    "zone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "donnees" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traces_bati_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "objet" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validite" TIMESTAMP(3) NOT NULL,
    "taux_tva" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "total_ht" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_tva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_ttc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "conditions" TEXT,
    "statut" "DevisStatut" NOT NULL DEFAULT 'BROUILLON',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dpgf_id" TEXT,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_devis" (
    "id" TEXT NOT NULL,
    "devis_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "designation" TEXT NOT NULL,
    "unite" TEXT,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL,
    "total_ht" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dpgf" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "statut" "DpgfStatut" NOT NULL DEFAULT 'BROUILLON',
    "version" INTEGER NOT NULL DEFAULT 1,
    "coefficient_frais_generaux" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "coefficient_marge" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "total_debourse_sec" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_vente_ht" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dpgf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses_chiffrage" (
    "id" TEXT NOT NULL,
    "dpgf_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "engine_version" TEXT NOT NULL,
    "score_completude" INTEGER NOT NULL,
    "alertes" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "comparaison" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_chiffrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots_dpgf" (
    "id" TEXT NOT NULL,
    "dpgf_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,

    CONSTRAINT "lots_dpgf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postes_dpgf" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "quantite" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "debourse_unitaire" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coefficient_vente" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "marge_unitaire" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_debourse" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_vente_ht" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "temps_unitaire_heures" DECIMAL(8,3),
    "type" "PosteDpgfType" NOT NULL DEFAULT 'BASE',
    "is_selected" BOOLEAN NOT NULL DEFAULT true,
    "ouvrage_id" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "postes_dpgf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metres" (
    "id" TEXT NOT NULL,
    "poste_id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "longueur" DECIMAL(12,3),
    "largeur" DECIMAL(12,3),
    "hauteur" DECIMAL(12,3),
    "coefficient" DECIMAL(8,3) NOT NULL DEFAULT 1,
    "quantite" DECIMAL(12,3) NOT NULL,
    "formule" TEXT,
    "variables" JSONB,
    "commentaire" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "type" "FactureType" NOT NULL DEFAULT 'DEFINITIVE',
    "objet" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "taux_tva" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "total_ht" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_tva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_ttc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mode_reglement" TEXT,
    "mentions_legales" TEXT,
    "statut" "FactureStatut" NOT NULL DEFAULT 'BROUILLON',
    "is_chorus_pro" BOOLEAN NOT NULL DEFAULT false,
    "chorus_pro_statut" TEXT,
    "chorus_pro_date_envoi" TIMESTAMP(3),
    "is_facturx" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_prestation" TIMESTAMP(3),
    "adresse_facturation" TEXT,
    "reference_acheteur" TEXT,
    "categorie_operation" "CategorieOperation" NOT NULL DEFAULT 'SERVICE',
    "montant_paye" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "source_devis_id" TEXT,
    "issued_at" TIMESTAMP(3),
    "content_hash" TEXT,
    "issued_snapshot" JSONB,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "paiements_factures" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mode" TEXT NOT NULL,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transmissions_electroniques" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "format" "FormatFactureElectronique" NOT NULL,
    "canal" "CanalTransmission" NOT NULL,
    "statut" "TransmissionStatut" NOT NULL DEFAULT 'PREPAREE',
    "payload_hash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "identifiant_externe" TEXT,
    "erreur" TEXT,
    "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "provider" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),

    CONSTRAINT "transmissions_electroniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentatives_transmission" (
    "id" TEXT NOT NULL,
    "transmission_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "code_http" INTEGER,
    "erreur" TEXT,
    "duree_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentatives_transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preuves_transmission" (
    "id" TEXT NOT NULL,
    "transmission_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "empreinte" TEXT NOT NULL,
    "contenu" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "external_event_id" TEXT,
    "occurred_at" TIMESTAMP(3),

    CONSTRAINT "preuves_transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_facture" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "designation" TEXT NOT NULL,
    "unite" TEXT,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL,
    "total_ht" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acomptes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "montant_ht" DECIMAL(12,2) NOT NULL,
    "pourcentage" DECIMAL(5,2),
    "taux_tva" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "total_ttc" DECIMAL(12,2) NOT NULL,
    "conditions" TEXT,
    "statut" "AcompteStatut" NOT NULL DEFAULT 'ATTENTE',
    "date_paiement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acomptes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "situations" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "periode_debut" TIMESTAMP(3) NOT NULL,
    "periode_fin" TIMESTAMP(3) NOT NULL,
    "total_ht" DECIMAL(12,2) NOT NULL,
    "retenue_garantie" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_a_payer" DECIMAL(12,2) NOT NULL,
    "statut" "SituationStatut" NOT NULL DEFAULT 'ETABLIE',
    "date_paiement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,

    CONSTRAINT "situations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retenues_garantie" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "situation_id" TEXT,
    "montant" DECIMAL(12,2) NOT NULL,
    "taux" DECIMAL(5,2) NOT NULL,
    "date_constitution" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_liberation_prevue" TIMESTAMP(3),
    "date_liberation" TIMESTAMP(3),
    "statut" "RetenueGarantieStatut" NOT NULL DEFAULT 'CONSTITUEE',
    "commentaire" TEXT,

    CONSTRAINT "retenues_garantie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receptions_chantiers" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" "ReceptionStatut" NOT NULL DEFAULT 'AVEC_RESERVES',
    "pv_url" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receptions_chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserves_reception" (
    "id" TEXT NOT NULL,
    "reception_id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "ReserveStatut" NOT NULL DEFAULT 'OUVERTE',
    "echeance" TIMESTAMP(3),
    "levee_at" TIMESTAMP(3),
    "preuve_url" TEXT,
    "commentaire" TEXT,

    CONSTRAINT "reserves_reception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sav_tickets" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "reception_id" TEXT,
    "numero" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priorite" "Priorite" NOT NULL DEFAULT 'NORMALE',
    "statut" "SavStatut" NOT NULL DEFAULT 'OUVERT',
    "signale_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "echeance" TIMESTAMP(3),
    "resolu_at" TIMESTAMP(3),
    "resolution" TEXT,

    CONSTRAINT "sav_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avoirs" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "montant_ht" DECIMAL(12,2) NOT NULL,
    "taux_tva" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "total_ttc" DECIMAL(12,2) NOT NULL,
    "statut" "AvoirStatut" NOT NULL DEFAULT 'EMIS',
    "date_imputation" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avoirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseur_id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_livraison" TIMESTAMP(3),
    "total_ht" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_tva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_ttc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "statut" "CommandeStatut" NOT NULL DEFAULT 'BROUILLON',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,
    "reference" TEXT,
    "designation" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL,
    "total_ht" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livraisons" (
    "id" TEXT NOT NULL,
    "numero_bl" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "LivraisonStatut" NOT NULL DEFAULT 'EN_COURS',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livraisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures_fournisseur" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseur_id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "total_ht" DECIMAL(12,2) NOT NULL,
    "total_tva" DECIMAL(12,2) NOT NULL,
    "total_ttc" DECIMAL(12,2) NOT NULL,
    "statut" "FactureFournStatut" NOT NULL DEFAULT 'A_PAYER',
    "date_paiement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factures_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets_chantiers" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "categorie" "CategorieCout" NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "commentaire" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depenses_chantiers" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "categorie" "CategorieCout" NOT NULL,
    "source" "SourceDepense" NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant_ht" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "commande_id" TEXT,
    "facture_fournisseur_id" TEXT,
    "justificatif_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affectations_sous_traitants" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "sous_traitant_id" TEXT NOT NULL,
    "lot" TEXT NOT NULL,
    "montant_engage_ht" DECIMAL(14,2) NOT NULL,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affectations_sous_traitants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3),
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "numero_secu" TEXT,
    "fonction" TEXT,
    "qualification" TEXT,
    "date_entree" TIMESTAMP(3),
    "date_sortie" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "cout_horaire_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "employe_id" TEXT NOT NULL,
    "type" "ContratType" NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "poste" TEXT NOT NULL,
    "coefficient" TEXT,
    "salaire_brut" DECIMAL(10,2) NOT NULL,
    "duree_essai" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pointages" (
    "id" TEXT NOT NULL,
    "employe_id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3),
    "duree_minutes" INTEGER,
    "type" "PointageType" NOT NULL DEFAULT 'TRAVAIL',
    "notes" TEXT,
    "is_sync" BOOLEAN NOT NULL DEFAULT false,
    "client_sync_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "validated_at" TIMESTAMP(3),
    "validated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pointages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bons_intervention" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "demandeur_id" TEXT NOT NULL,
    "employe_id" TEXT,
    "chantier_id" TEXT,
    "objet" TEXT NOT NULL,
    "priorite" "Priorite" NOT NULL DEFAULT 'NORMALE',
    "statut" "BonStatut" NOT NULL DEFAULT 'EN_COURS',
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_traitement" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bons_intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_entries" (
    "id" TEXT NOT NULL,
    "employe_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "PlanningType" NOT NULL DEFAULT 'TRAVAIL',
    "chantier_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planning_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taches_gantt" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "couleur" TEXT NOT NULL DEFAULT '#2563eb',
    "dependance_id" TEXT,
    "ressources" TEXT[],
    "avancement" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "client_sync_id" TEXT,

    CONSTRAINT "taches_gantt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jalons_gantt" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jalons_gantt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "lieu" TEXT,
    "description" TEXT,
    "phase" "PhotoPhase" NOT NULL DEFAULT 'PENDANT',
    "zone" TEXT,
    "ouvrage_id" TEXT,
    "annotations" JSONB,
    "hash_sha256" TEXT,
    "client_sync_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "date_prise" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_id" TEXT NOT NULL,
    "is_sync" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents_chantiers" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "type" "DocumentChantierType" NOT NULL,
    "phase" "PhotoPhase",
    "zone" TEXT,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "taille" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "hash_sha256" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ouvrages" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL,
    "date_maj" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categorie" TEXT,
    "sous_categorie" TEXT,
    "debourse_sec" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coefficient_vente" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "temps_pose_heures" DECIMAL(8,3),
    "rendement" DECIMAL(10,3),
    "description_technique" TEXT,
    "is_actif" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ouvrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composants_ouvrages" (
    "id" TEXT NOT NULL,
    "ouvrage_id" TEXT NOT NULL,
    "type" "RessourceType" NOT NULL,
    "designation" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "quantite" DECIMAL(12,4) NOT NULL,
    "prix_unitaire" DECIMAL(12,4) NOT NULL,
    "taux_perte" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "fournisseur" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "composants_ouvrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historiques_prix_ouvrages" (
    "id" TEXT NOT NULL,
    "ouvrage_id" TEXT NOT NULL,
    "prix_achat" DECIMAL(12,2) NOT NULL,
    "prix_vente" DECIMAL(12,2) NOT NULL,
    "fournisseur" TEXT,
    "date_effet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaire" TEXT,

    CONSTRAINT "historiques_prix_ouvrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiaux" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "fournisseur_id" TEXT,
    "prix_unitaire_ht" DECIMAL(12,2) NOT NULL,
    "stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unite" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_bancaires" (
    "id" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "banque" TEXT NOT NULL,
    "mode_reglement" TEXT,
    "compte_comptable" TEXT,
    "is_rapproche" BOOLEAN NOT NULL DEFAULT false,
    "justificatif_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_bancaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declarations_tva" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "tva_collectee" DECIMAL(12,2) NOT NULL,
    "tva_deductible" DECIMAL(12,2) NOT NULL,
    "montant_a_payer" DECIMAL(12,2) NOT NULL,
    "is_credit" BOOLEAN NOT NULL DEFAULT false,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "date_declaration" TIMESTAMP(3),
    "statut" "DeclarationStatut" NOT NULL DEFAULT 'A_DECLARER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "declarations_tva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "numero_piece" TEXT NOT NULL,
    "compte" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "debit" DECIMAL(12,2),
    "credit" DECIMAL(12,2),
    "lettrage" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coproprietes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "nombre_lots" INTEGER NOT NULL,
    "date_construction" TIMESTAMP(3),
    "syndic_nom" TEXT,
    "syndic_contact" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coproprietes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "copropriete_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "designation" TEXT,
    "tantiemes" INTEGER NOT NULL,
    "surface" DECIMAL(8,2),
    "derniers_travaux" TEXT,
    "point_situation" "LotSituation" NOT NULL DEFAULT 'NON_COMMENCE',
    "montant_consignation" DECIMAL(12,2),
    "dpe_classe" TEXT,
    "dpe_consommation" DECIMAL(8,2),
    "dpe_emissions" DECIMAL(8,2),
    "dpe_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostics" (
    "id" TEXT NOT NULL,
    "copropriete_id" TEXT NOT NULL,
    "type" "DiagnosticType" NOT NULL,
    "lot_id" TEXT,
    "date_realisation" TIMESTAMP(3) NOT NULL,
    "date_validite" TIMESTAMP(3) NOT NULL,
    "diagnostiqueur" TEXT,
    "numero_attestation" TEXT,
    "conclusion" "DiagnosticConclusion" NOT NULL DEFAULT 'CONFORME',
    "observations" TEXT,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dtgs" (
    "id" TEXT NOT NULL,
    "copropriete_id" TEXT NOT NULL,
    "date_realisation" TIMESTAMP(3) NOT NULL,
    "date_validite" TIMESTAMP(3) NOT NULL,
    "diagnostiqueur" TEXT,
    "observations" TEXT,
    "is_conforme" BOOLEAN NOT NULL DEFAULT true,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dtgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements_historiques" (
    "id" TEXT NOT NULL,
    "copropriete_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "EvenementType" NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "cout" DECIMAL(12,2),
    "documents" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenements_historiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carnets_entretien" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "chantier_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_reception" TIMESTAMP(3) NOT NULL,
    "duree_garantie" INTEGER NOT NULL DEFAULT 10,
    "qr_code_url" TEXT,
    "pdf_url" TEXT,
    "is_envoye_client" BOOLEAN NOT NULL DEFAULT false,
    "date_envoi" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carnets_entretien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "chantier_id" TEXT,
    "contenu" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'TEXT',
    "created_by_id" TEXT NOT NULL,
    "is_sync" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents_juridiques" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "is_modele" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_juridiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChantierToLot" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "journal_audit_user_id_created_at_idx" ON "journal_audit"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "journal_audit_chemin_created_at_idx" ON "journal_audit"("chemin", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "parametres_numerotation_type_key" ON "parametres_numerotation"("type");

-- CreateIndex
CREATE UNIQUE INDEX "chantiers_reference_key" ON "chantiers"("reference");

-- CreateIndex
CREATE INDEX "visites_techniques_prospect_id_date_prevue_idx" ON "visites_techniques"("prospect_id", "date_prevue");

-- CreateIndex
CREATE INDEX "visites_techniques_chantier_id_date_prevue_idx" ON "visites_techniques"("chantier_id", "date_prevue");

-- CreateIndex
CREATE INDEX "diagnostics_bati_chantier_id_zone_idx" ON "diagnostics_bati"("chantier_id", "zone");

-- CreateIndex
CREATE INDEX "aleas_chantiers_chantier_id_statut_idx" ON "aleas_chantiers"("chantier_id", "statut");

-- CreateIndex
CREATE INDEX "travaux_conservatoires_chantier_id_statut_idx" ON "travaux_conservatoires"("chantier_id", "statut");

-- CreateIndex
CREATE INDEX "traces_bati_chantier_id_created_at_idx" ON "traces_bati"("chantier_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "devis_numero_key" ON "devis"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "devis_dpgf_id_key" ON "devis"("dpgf_id");

-- CreateIndex
CREATE UNIQUE INDEX "dpgf_reference_key" ON "dpgf"("reference");

-- CreateIndex
CREATE INDEX "dpgf_chantier_id_idx" ON "dpgf"("chantier_id");

-- CreateIndex
CREATE INDEX "analyses_chiffrage_dpgf_id_created_at_idx" ON "analyses_chiffrage"("dpgf_id", "created_at");

-- CreateIndex
CREATE INDEX "lots_dpgf_dpgf_id_ordre_idx" ON "lots_dpgf"("dpgf_id", "ordre");

-- CreateIndex
CREATE INDEX "lots_dpgf_parent_id_idx" ON "lots_dpgf"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "lots_dpgf_dpgf_id_code_key" ON "lots_dpgf"("dpgf_id", "code");

-- CreateIndex
CREATE INDEX "postes_dpgf_lot_id_ordre_idx" ON "postes_dpgf"("lot_id", "ordre");

-- CreateIndex
CREATE INDEX "postes_dpgf_ouvrage_id_idx" ON "postes_dpgf"("ouvrage_id");

-- CreateIndex
CREATE UNIQUE INDEX "postes_dpgf_lot_id_code_key" ON "postes_dpgf"("lot_id", "code");

-- CreateIndex
CREATE INDEX "metres_poste_id_idx" ON "metres"("poste_id");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "factures_source_devis_id_key" ON "factures"("source_devis_id");

-- CreateIndex
CREATE INDEX "paiements_factures_facture_id_date_idx" ON "paiements_factures"("facture_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "transmissions_electroniques_identifiant_externe_key" ON "transmissions_electroniques"("identifiant_externe");

-- CreateIndex
CREATE INDEX "transmissions_electroniques_facture_id_statut_idx" ON "transmissions_electroniques"("facture_id", "statut");

-- CreateIndex
CREATE INDEX "tentatives_transmission_transmission_id_created_at_idx" ON "tentatives_transmission"("transmission_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "preuves_transmission_external_event_id_key" ON "preuves_transmission"("external_event_id");

-- CreateIndex
CREATE INDEX "preuves_transmission_transmission_id_received_at_idx" ON "preuves_transmission"("transmission_id", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "acomptes_numero_key" ON "acomptes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "situations_numero_key" ON "situations"("numero");

-- CreateIndex
CREATE INDEX "retenues_garantie_chantier_id_statut_idx" ON "retenues_garantie"("chantier_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "receptions_chantiers_chantier_id_key" ON "receptions_chantiers"("chantier_id");

-- CreateIndex
CREATE INDEX "reserves_reception_reception_id_statut_idx" ON "reserves_reception"("reception_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "sav_tickets_numero_key" ON "sav_tickets"("numero");

-- CreateIndex
CREATE INDEX "sav_tickets_chantier_id_statut_idx" ON "sav_tickets"("chantier_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "avoirs_numero_key" ON "avoirs"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_numero_key" ON "commandes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "livraisons_numero_bl_key" ON "livraisons"("numero_bl");

-- CreateIndex
CREATE UNIQUE INDEX "factures_fournisseur_numero_key" ON "factures_fournisseur"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_chantiers_chantier_id_categorie_key" ON "budgets_chantiers"("chantier_id", "categorie");

-- CreateIndex
CREATE INDEX "depenses_chantiers_chantier_id_categorie_date_idx" ON "depenses_chantiers"("chantier_id", "categorie", "date");

-- CreateIndex
CREATE INDEX "affectations_sous_traitants_chantier_id_idx" ON "affectations_sous_traitants"("chantier_id");

-- CreateIndex
CREATE UNIQUE INDEX "employes_user_id_key" ON "employes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pointages_client_sync_id_key" ON "pointages"("client_sync_id");

-- CreateIndex
CREATE UNIQUE INDEX "bons_intervention_numero_key" ON "bons_intervention"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "taches_gantt_client_sync_id_key" ON "taches_gantt"("client_sync_id");

-- CreateIndex
CREATE UNIQUE INDEX "photos_client_sync_id_key" ON "photos"("client_sync_id");

-- CreateIndex
CREATE INDEX "documents_chantiers_chantier_id_type_zone_idx" ON "documents_chantiers"("chantier_id", "type", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "ouvrages_reference_key" ON "ouvrages"("reference");

-- CreateIndex
CREATE INDEX "composants_ouvrages_ouvrage_id_ordre_idx" ON "composants_ouvrages"("ouvrage_id", "ordre");

-- CreateIndex
CREATE INDEX "historiques_prix_ouvrages_ouvrage_id_date_effet_idx" ON "historiques_prix_ouvrages"("ouvrage_id", "date_effet");

-- CreateIndex
CREATE UNIQUE INDEX "materiaux_reference_key" ON "materiaux"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "carnets_entretien_numero_key" ON "carnets_entretien"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "_ChantierToLot_AB_unique" ON "_ChantierToLot"("A", "B");

-- CreateIndex
CREATE INDEX "_ChantierToLot_B_index" ON "_ChantierToLot"("B");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_converted_to_client_id_fkey" FOREIGN KEY ("converted_to_client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantiers" ADD CONSTRAINT "chantiers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantiers" ADD CONSTRAINT "chantiers_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites_techniques" ADD CONSTRAINT "visites_techniques_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites_techniques" ADD CONSTRAINT "visites_techniques_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites_techniques" ADD CONSTRAINT "visites_techniques_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites_techniques" ADD CONSTRAINT "visites_techniques_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics_bati" ADD CONSTRAINT "diagnostics_bati_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics_bati" ADD CONSTRAINT "diagnostics_bati_visite_id_fkey" FOREIGN KEY ("visite_id") REFERENCES "visites_techniques"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics_bati" ADD CONSTRAINT "diagnostics_bati_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aleas_chantiers" ADD CONSTRAINT "aleas_chantiers_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travaux_conservatoires" ADD CONSTRAINT "travaux_conservatoires_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travaux_conservatoires" ADD CONSTRAINT "travaux_conservatoires_diagnostic_id_fkey" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostics_bati"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traces_bati" ADD CONSTRAINT "traces_bati_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traces_bati" ADD CONSTRAINT "traces_bati_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_dpgf_id_fkey" FOREIGN KEY ("dpgf_id") REFERENCES "dpgf"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_devis" ADD CONSTRAINT "lignes_devis_devis_id_fkey" FOREIGN KEY ("devis_id") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dpgf" ADD CONSTRAINT "dpgf_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dpgf" ADD CONSTRAINT "dpgf_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses_chiffrage" ADD CONSTRAINT "analyses_chiffrage_dpgf_id_fkey" FOREIGN KEY ("dpgf_id") REFERENCES "dpgf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses_chiffrage" ADD CONSTRAINT "analyses_chiffrage_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots_dpgf" ADD CONSTRAINT "lots_dpgf_dpgf_id_fkey" FOREIGN KEY ("dpgf_id") REFERENCES "dpgf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots_dpgf" ADD CONSTRAINT "lots_dpgf_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lots_dpgf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postes_dpgf" ADD CONSTRAINT "postes_dpgf_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_dpgf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postes_dpgf" ADD CONSTRAINT "postes_dpgf_ouvrage_id_fkey" FOREIGN KEY ("ouvrage_id") REFERENCES "ouvrages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metres" ADD CONSTRAINT "metres_poste_id_fkey" FOREIGN KEY ("poste_id") REFERENCES "postes_dpgf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_source_devis_id_fkey" FOREIGN KEY ("source_devis_id") REFERENCES "devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_factures" ADD CONSTRAINT "paiements_factures_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmissions_electroniques" ADD CONSTRAINT "transmissions_electroniques_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives_transmission" ADD CONSTRAINT "tentatives_transmission_transmission_id_fkey" FOREIGN KEY ("transmission_id") REFERENCES "transmissions_electroniques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preuves_transmission" ADD CONSTRAINT "preuves_transmission_transmission_id_fkey" FOREIGN KEY ("transmission_id") REFERENCES "transmissions_electroniques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_facture" ADD CONSTRAINT "lignes_facture_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acomptes" ADD CONSTRAINT "acomptes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acomptes" ADD CONSTRAINT "acomptes_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "situations" ADD CONSTRAINT "situations_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "situations" ADD CONSTRAINT "situations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenues_garantie" ADD CONSTRAINT "retenues_garantie_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenues_garantie" ADD CONSTRAINT "retenues_garantie_situation_id_fkey" FOREIGN KEY ("situation_id") REFERENCES "situations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptions_chantiers" ADD CONSTRAINT "receptions_chantiers_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves_reception" ADD CONSTRAINT "reserves_reception_reception_id_fkey" FOREIGN KEY ("reception_id") REFERENCES "receptions_chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sav_tickets" ADD CONSTRAINT "sav_tickets_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sav_tickets" ADD CONSTRAINT "sav_tickets_reception_id_fkey" FOREIGN KEY ("reception_id") REFERENCES "receptions_chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avoirs" ADD CONSTRAINT "avoirs_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avoirs" ADD CONSTRAINT "avoirs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livraisons" ADD CONSTRAINT "livraisons_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures_fournisseur" ADD CONSTRAINT "factures_fournisseur_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures_fournisseur" ADD CONSTRAINT "factures_fournisseur_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets_chantiers" ADD CONSTRAINT "budgets_chantiers_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses_chantiers" ADD CONSTRAINT "depenses_chantiers_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses_chantiers" ADD CONSTRAINT "depenses_chantiers_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses_chantiers" ADD CONSTRAINT "depenses_chantiers_facture_fournisseur_id_fkey" FOREIGN KEY ("facture_fournisseur_id") REFERENCES "factures_fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses_chantiers" ADD CONSTRAINT "depenses_chantiers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations_sous_traitants" ADD CONSTRAINT "affectations_sous_traitants_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations_sous_traitants" ADD CONSTRAINT "affectations_sous_traitants_sous_traitant_id_fkey" FOREIGN KEY ("sous_traitant_id") REFERENCES "sous_traitants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_validated_by_id_fkey" FOREIGN KEY ("validated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_intervention" ADD CONSTRAINT "bons_intervention_demandeur_id_fkey" FOREIGN KEY ("demandeur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_intervention" ADD CONSTRAINT "bons_intervention_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_intervention" ADD CONSTRAINT "bons_intervention_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_entries" ADD CONSTRAINT "planning_entries_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_entries" ADD CONSTRAINT "planning_entries_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches_gantt" ADD CONSTRAINT "taches_gantt_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches_gantt" ADD CONSTRAINT "taches_gantt_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jalons_gantt" ADD CONSTRAINT "jalons_gantt_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_ouvrage_id_fkey" FOREIGN KEY ("ouvrage_id") REFERENCES "ouvrages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_chantiers" ADD CONSTRAINT "documents_chantiers_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composants_ouvrages" ADD CONSTRAINT "composants_ouvrages_ouvrage_id_fkey" FOREIGN KEY ("ouvrage_id") REFERENCES "ouvrages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiques_prix_ouvrages" ADD CONSTRAINT "historiques_prix_ouvrages_ouvrage_id_fkey" FOREIGN KEY ("ouvrage_id") REFERENCES "ouvrages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_bancaires" ADD CONSTRAINT "operations_bancaires_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_copropriete_id_fkey" FOREIGN KEY ("copropriete_id") REFERENCES "coproprietes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_copropriete_id_fkey" FOREIGN KEY ("copropriete_id") REFERENCES "coproprietes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dtgs" ADD CONSTRAINT "dtgs_copropriete_id_fkey" FOREIGN KEY ("copropriete_id") REFERENCES "coproprietes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements_historiques" ADD CONSTRAINT "evenements_historiques_copropriete_id_fkey" FOREIGN KEY ("copropriete_id") REFERENCES "coproprietes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carnets_entretien" ADD CONSTRAINT "carnets_entretien_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_chantier_id_fkey" FOREIGN KEY ("chantier_id") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChantierToLot" ADD CONSTRAINT "_ChantierToLot_A_fkey" FOREIGN KEY ("A") REFERENCES "chantiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChantierToLot" ADD CONSTRAINT "_ChantierToLot_B_fkey" FOREIGN KEY ("B") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
