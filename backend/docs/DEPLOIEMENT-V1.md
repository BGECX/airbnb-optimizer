# Déploiement et retour arrière — KRITIA V1

## Préconditions

- hôte Linux maintenu, Docker Engine et Compose récents ;
- DNS, TLS et reverse proxy configurés ;
- secrets distincts dans un gestionnaire de secrets, jamais dans le dépôt ;
- PostgreSQL et Redis supervisés ;
- sauvegarde externalisée et restauration testée ;
- image API identifiée par un tag immuable ou un digest.

Variables minimales : `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `POSTGRES_PASSWORD`, `FRONTEND_URL`. `METRICS_TOKEN` active `/api/operations/metrics`. Les secrets JWT et métriques font au moins 32 caractères.

Pour activer « Mot de passe oublié », définir `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` et `PUBLIC_APP_URL`. Exemple OVH : `SMTP_HOST=smtp.mail.ovh.net`, `SMTP_PORT=587`, `PUBLIC_APP_URL=https://www.getkritia.com`. Le mot de passe SMTP reste exclusivement dans le gestionnaire de secrets de l’hébergeur.

## Mise en production

1. Exécuter `scripts/release-check.sh` contre une base isolée se terminant par `_test`.
2. Sauvegarder la production avec `scripts/backup-postgres.sh`, puis vérifier cette sauvegarde sur une base `_restore_test`.
3. Construire et scanner l'image ; publier son digest dans le registre choisi.
4. Vérifier `docker compose config`, puis exécuter le migrateur une seule fois.
5. Démarrer l'API et vérifier `/api/health/live`, `/api/health/ready`, une connexion et un parcours métier témoin.
6. Surveiller erreurs 5xx, latence, PostgreSQL, Redis, espace disque et expiration des sauvegardes.

## Retour arrière

Le retour applicatif utilise `ROLLBACK_IMAGE=<image-immuable> scripts/rollback-compose.sh`. Il ne tente jamais d'annuler une migration de données. Les migrations V1 sont conçues pour être appliquées avant l'API ; toute migration future incompatible doit suivre une stratégie expansion/contraction.

Si les données ont été altérées, arrêter les écritures, conserver une copie forensique, puis restaurer la dernière sauvegarde vérifiée dans une nouvelle base. Ne jamais restaurer directement par-dessus la base de production.

## Alertes minimales

- readiness indisponible plus de deux minutes ;
- taux de 5xx ou latence anormale ;
- Redis ou PostgreSQL indisponible ;
- disque supérieur à 80 % ;
- sauvegarde absente ou non vérifiée dans la fenêtre RPO ;
- hausse des 401, 403 ou 429.
