# KRITIA API

La conception de la boutique publicitaire et du modèle de crédits pour les logos IA est décrite dans [`docs/BOUTIQUE-LOGOS-IA.md`](docs/BOUTIQUE-LOGOS-IA.md).

Backend NestJS + Prisma + PostgreSQL pour l'application de gestion BTP KRITIA.

## Stack technique

- **Framework** : NestJS 11
- **ORM** : Prisma 5
- **Base de données** : PostgreSQL 16
- **Cache** : Redis 7
- **Auth** : JWT + Passport
- **Docs** : Swagger/OpenAPI
- **Container** : Docker + Docker Compose

## Démarrage rapide

### 1. Prérequis

- Docker & Docker Compose
- Node.js 20+ (pour le développement local)

### 2. Installation

```bash
# Cloner le projet
cd kritia-backend

# Copier les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer l'infrastructure
docker-compose up -d

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Base neuve : exécuter la migration versionnée
npx prisma migrate deploy

# (Optionnel) Peupler la base
docker-compose exec api npx prisma db seed

# Démarrer le serveur en dev
npm run start:dev
```

### 3. Accès

- API : http://localhost:3000/api
- Swagger : http://localhost:3000/api/docs
- pgAdmin : http://localhost:5050 (identifiants définis dans `.env`)

### 4. Structure du projet

```
src/
├── auth/           # Authentification JWT
├── users/          # Gestion des utilisateurs
├── clients/        # Clients, fournisseurs, sous-traitants, prospects
├── devis/          # Devis et lignes
├── factures/       # Factures, acomptes, situations, avoirs
├── chantiers/      # Chantiers et lots
├── taches-gantt/   # Planning Gantt (tâches et jalons)
├── photos/         # Photos de chantier
├── personnel/      # Employés, contrats, pointages, bons
├── achats/         # Commandes, livraisons, factures fournisseurs
├── banque/         # Opérations bancaires
├── comptabilite/   # TVA, FEC, écritures
├── coproprietes/   # Copropriétés, lots, diagnostics, DTG
├── parametres/     # Entreprise, numérotation, banques, assurances
├── dpgf/           # Lots, sous-lots, postes, options, variantes et métrés
├── bibliotheque/   # Ouvrages composés et historiques de prix
├── renovation/     # Diagnostics du bâti, aléas, conservatoire, traçabilité
├── commercial/     # Prospects, visites, réception, SAV, situations
├── pilotage/       # Budgets, dépenses, engagements et rentabilité
├── compagnon/      # Pointage, tâches, photos et bons terrain
├── chiffrage-assiste/ # Contrôles, suggestions et comparaisons historiques
├── prisma/         # Schéma et migrations
└── common/         # Guards, decorators, interceptors
```

### 5. Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/refresh | Rotation de session |
| POST | /api/auth/logout | Révoquer une session |
| GET | /api/auth/me | Profil connecté |
| GET | /api/clients | Liste des clients |
| POST | /api/devis | Créer un devis |
| POST | /api/devis/:id/facture | Transformer un devis accepté |
| GET | /api/factures | Liste des factures |
| GET | /api/chantiers | Liste des chantiers |
| GET | /api/taches-gantt | Planning Gantt |
| GET | /api/coproprietes | Copropriétés |
| GET | /api/comptabilite/stats | Stats comptables |
| GET | /api/dpgf/:id | DPGF complète et métrés |
| POST | /api/dpgf/:id/devis | Transformer une DPGF validée en devis |
| GET | /api/bibliotheque/ouvrages | Bibliothèque d'ouvrages |
| GET | /api/chantiers/:id/renovation | Dossier du bâti existant |
| GET | /api/commercial/prospects | Pipeline commercial |
| GET | /api/chantiers/:id/pilotage | Rentabilité chantier |
| GET | /api/compagnon/me | Espace terrain de l'employé |
| GET | /api/factures/:id/conformite | Contrôle avant facture électronique |
| POST | /api/chiffrage-assiste/dpgf/:id/analyser | Analyse du chiffrage |
| GET | /api/health/ready | État de PostgreSQL et Redis configuré |
| POST | /api/factures/electronique/transmissions/:id/envoyer | Envoyer via le connecteur configuré |

### 6. Rôles utilisateurs

- `ADMIN` : Accès complet
- `MANAGER` : Gestion commerciale et chantiers
- `CHEF_CHANTIER` : Gestion des chantiers et équipes
- `COMPTABLE` : Comptabilité et banque
- `COMPAGNON` : Pointage, photos, notes
- `USER` : Lecture seule

### 7. Commandes utiles

```bash
# Générer une migration
npx prisma migrate dev --name nom_migration

# Ouvrir Prisma Studio
npx prisma studio

# Reset de la base
npx prisma migrate reset

# Tests
npm run test

# Tests d'intégration : DATABASE_URL doit cibler une base se terminant par _test
npm run test:e2e -- --runInBand

# Sauvegarde PostgreSQL via le profil de maintenance
docker compose --profile maintenance run --rm backup

# Build production
npm run build
npm run start:prod
```

### Sécurité et limites V1

- `JWT_SECRET`, `POSTGRES_PASSWORD`, `PGADMIN_PASSWORD` et `SEED_ADMIN_PASSWORD` doivent être changés avant usage.
- En production, conservez `REDIS_URL` : la limitation d’authentification est alors partagée entre les instances et refuse les requêtes sensibles si Redis est indisponible.
- L'API recalcule les montants des devis et factures ; les totaux envoyés par le client ne font pas foi.
- Le backend DPGF/métrés et bibliothèque est documenté dans `docs/DPGF-BIBLIOTHEQUE.md`. L'interface utilisateur, l'import Excel et les fonctions IA ne sont pas encore implémentés.
- Une migration initiale complète est versionnée. Ne l'appliquez pas telle quelle sur une base existante : établissez d'abord une migration différentielle et une sauvegarde.
- Le lockfile npm est versionné. Les contrôles `prisma validate`, lint, build, tests et audit npm passent sur cette livraison.
- La préparation électronique est documentée dans `docs/FACTURATION-ELECTRONIQUE.md` et ne prétend pas remplacer une plateforme agréée.
- Sessions, sauvegardes et exploitation sont documentées dans `docs/SECURITE-EXPLOITATION.md`.
- Numérotation atomique et transformation transactionnelle sont documentées dans `docs/INTEGRITE-COMMERCIALE.md`.
- Matrice des rôles, DTO historiques et pagination sont documentés dans `docs/DROITS-ET-PAGINATION.md`.
- Le contrat d'intégration d'une plateforme agréée est documenté dans `docs/CONNECTEUR-PLATEFORME-AGREEE.md`.
- Les tests PostgreSQL, la CI et le conteneur de migration sont documentés dans `docs/TESTS-INTEGRATION-CI.md`.
- Le déploiement, le retour arrière et la recette sont décrits dans `docs/DEPLOIEMENT-V1.md` et `docs/RECETTE-V1.md`.
- Le périmètre réellement livré et les limites restantes sont déclarés dans `docs/PERIMETRE-V1.md`.

---
KRITIA © 2026
