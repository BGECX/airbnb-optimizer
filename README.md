# KRITIA Frontend

Interface web responsive du backend KRITIA pour les entreprises de rénovation.

## Fonctions de cette première version

- connexion JWT à une API KRITIA configurable ;
- tableau de bord commercial et chantier ;
- listes clients, chantiers, devis, factures et DPGF ;
- données filtrées selon les autorisations renvoyées par l’API ;
- mode démonstration sans accès aux données réelles ;
- session conservée uniquement dans l’onglet courant ;
- mise en page adaptée aux ordinateurs, tablettes et mobiles.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`, puis renseigner l’adresse du backend dans « Configuration de l’API ». Par défaut, le frontend utilise `http://localhost:3000/api`. Si les deux applications tournent localement, attribuer un autre port au backend ou au frontend.

Pour une publication distante, le backend doit disposer d’une adresse HTTPS publique et autoriser l’URL du frontend dans `FRONTEND_URL`.

## Vérification

```bash
npm run lint
npm test
npx tsc --noEmit
```
