# Tests d'intégration et CI — phase 12

## Test PostgreSQL réel

`npm run test:e2e -- --runInBand` démarre NestJS sur un port aléatoire et appelle l'API par HTTP. Il couvre :

- inscription publique toujours limitée au rôle `USER` ;
- connexion et rotation du refresh token ;
- refus de réutilisation de l'ancien refresh token ;
- refus d'une mutation client par un utilisateur sans rôle ;
- création de devis avec numéros distincts ;
- transitions `BROUILLON → ENVOYE → ACCEPTE` ;
- transformation transactionnelle en facture ;
- refus d'une deuxième transformation.

Protection : le test refuse de démarrer si le nom de la base extrait de `DATABASE_URL` ne se termine pas par `_test`.

## Pipeline

`.github/workflows/ci.yml` crée PostgreSQL 16 et Redis 7 avec healthchecks, puis exécute :

1. `npm ci` et génération Prisma ;
2. migration sur `kritia_test` ;
3. lint, tests unitaires et compilation ;
4. tests end-to-end ;
5. construction de l'image API ;
6. construction de l'image de migration.

## Déploiement Compose

Le service éphémère `migrate` exécute `prisma migrate deploy` après le healthcheck PostgreSQL. L'API ne démarre que si les migrations réussissent. L'image API finale reste allégée et ne contient pas les dépendances de développement.

## Validation locale

PostgreSQL 16.14 a été installé et la migration initiale a été appliquée à `kritia_test`. La suite e2e et ses deux scénarios passent réellement. Elle a détecté deux défauts désormais corrigés : la visibilité de `JwtService` dans les modules protégés et la conversion des dates ISO courtes vers les `DateTime` attendus par Prisma.

Docker CLI, Docker Compose et Colima ont été installés puis exécutés. Les images API et migrateur ont été construites. Un smoke test Compose isolé a confirmé : migration réussie, API exécutée sous l'utilisateur non privilégié `node`, healthcheck Docker sain et connexion PostgreSQL prête.

Un second smoke test Compose a validé Redis comme dépendance partagée de sécurité : readiness `redis: ok`, limitation à la onzième tentative (`429`) et refus fermé (`503`) de la readiness et de la connexion lorsque Redis est arrêté.

Ces essais ont corrigé trois défauts qui auraient empêché ou fragilisé le déploiement : contexte Docker de près de 300 Mo faute de `.dockerignore`, OpenSSL absent d'Alpine pour Prisma et ancien point d'entrée `dist/main` au lieu de `dist/src/main`.
