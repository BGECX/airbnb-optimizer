# Airbnb Optimizer

Micro-SaaS B2B d'analyse d'avis et d'optimisation d'annonces Airbnb/Booking.

## Architecture

- **Frontend** : Next.js 14 (App Router) + Tailwind CSS + next-intl (50 langues)
- **Backend** : FastAPI (Python) — NLP + Génération de descriptions
- **Orchestration** : Docker Compose

## Démarrage rapide (Docker)

```bash
# 1. Cloner / naviguer dans le projet
cd nextjs-airbnb-optimizer

# 2. Lancer l'ensemble
docker-compose up --build

# 3. Accéder aux services
# Frontend : http://localhost:3000/fr
# Backend API : http://localhost:8000/docs
# Healthcheck : http://localhost:8000/health
```

## Démarrage manuel (développement)

### Backend Python

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Next.js

```bash
# À la racine du projet
npm install
npm run dev
```

Le frontend appelle le backend via la variable d'environnement `API_BASE_URL`.

## Structure du projet

```
.
├── backend/              # API FastAPI (NLP + Génération)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── app/                  # Next.js App Router
│   ├── [locale]/         # Routes i18n
│   └── api/analyze/      # Proxy API vers FastAPI
├── components/           # Composants React
├── messages/             # Fichiers de traduction (50 langues)
├── lib/                  # Utils + config i18n
├── types/                # Types TypeScript
├── Dockerfile            # Frontend container
├── docker-compose.yml    # Orchestration complète
└── next.config.mjs       # Config Next.js (standalone)
```

## API Backend

### POST /analyze

Analyse un jeu d'avis et retourne le diagnostic + la description optimisée.

**Request:**
```json
{
  "reviews": [
    { "id": 1, "note": 5, "texte": "Séjour parfait, très propre !" },
    { "id": 2, "note": 2, "texte": "Déçu, le wifi ne fonctionnait pas..." }
  ],
  "langue": "fr",
  "logement_info": {
    "type": "appartement",
    "surface": "45 m²",
    "chambres": 1,
    "couchages": 2,
    "quartier": "centre historique",
    "ville": "Lyon"
  }
}
```

**Response:**
```json
{
  "success": true,
  "diagnostic": { ... },
  "optimized": { ... }
}
```

### GET /health

Healthcheck du service.

## Internationalisation

Le site supporte 50 langues via `next-intl`.

Langues déjà traduites : `fr`, `en`, `es`, `de`, `zh`, `ja`, `ar`.
Pour ajouter une langue :

1. Copier `messages/_template.json` en `messages/XX.json`
2. Traduire les valeurs
3. La locale est déjà enregistrée dans `lib/i18n.ts`

Accès : `http://localhost:3000/fr`, `/en`, `/es`, `/de`, `/zh`, `/ja`, `/ar`...

## Roadmap

- [x] Pipeline NLP (lexique + taxonomie)
- [x] Générateur de descriptions
- [x] Interface Next.js + i18n
- [x] Docker + orchestration
- [ ] Auth & billing (Stripe)
- [ ] Scraping Airbnb/Booking
- [ ] Fine-tuning modèle ABSA
- [ ] A/B testing des descriptions
