# Setup Clerk + Supabase + Stripe

Ce guide complète le README principal. Suivez ces étapes pour activer l'authentification et la persistance des données.

---

## 1. Clerk (Authentification)

### Créer un compte
1. Allez sur https://dashboard.clerk.com
2. Créez une application
3. Dans **API Keys**, copiez :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Configurer les fournisseurs
Dans le Dashboard Clerk → **User & Authentication** → **Social Providers** :
- Activez **Google**
- Ajoutez vos credentials OAuth (ou laissez Clerk gérer les defaults pour le dev)
- Activez **Email + Password** (déjà actif par défaut)

### Configurer les URLs
Dans **Settings** → **URLs** :
- Sign-in URL : `/sign-in`
- Sign-up URL : `/sign-up`
- Allowed redirect URLs : `http://localhost:3000/*` (dev) + votre domaine prod

---

## 2. Supabase (Base de données)

### Créer un projet
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Dans **Project Settings** → **API**, copiez :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secrète, côté serveur uniquement)

### Créer les tables
1. Allez dans l'**SQL Editor**
2. Collez le contenu de `supabase/schema.sql`
3. Exécutez

Vérifiez que les tables `analyses` et `subscriptions` sont créées avec RLS activé.

---

## 3. Stripe (Paiements)

Déjà documenté dans le README principal. Points clés :
- Créer 2 produits (Starter 29€/mois, Pro 79€/mois)
- Récupérer les `price_xxx`
- Configurer le webhook vers `/api/webhooks/stripe`
- Récupérer le `whsec_xxx`

---

## 4. Variables d'environnement

```bash
cp .env.example .env.local
# Éditez .env.local avec vos vraies clés
```

---

## 5. Lancer le projet

```bash
# Mode développement (recommandé pour tester Clerk/Supabase)
npm install
cd backend && pip install -r requirements.txt && uvicorn main:app --reload &
cd .. && npm run dev

# Ou Docker (sans les variables Clerk/Supabase injectées, le auth ne fonctionnera pas)
docker-compose up --build
```

---

## 6. Vérification

1. Ouvrez http://localhost:3000/fr
2. Cliquez sur **S'inscrire** → créez un compte (ou Google OAuth)
3. Faites une analyse → vérifiez dans Supabase que la ligne apparaît dans `analyses`
4. Cliquez sur **S'abonner** → vérifiez dans Supabase que la ligne apparaît dans `subscriptions`
