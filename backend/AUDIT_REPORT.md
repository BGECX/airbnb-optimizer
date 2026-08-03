# Audit et livraison KRITIA — V1 renforcée

Date : 3 août 2026

## Verdict initial

Le projet reçu est une base NestJS/Prisma structurée, mais pas une V1 prête pour la production. Le fichier `package.json` était invalide, les décorateurs de rôles n'étaient pas appliqués par un guard, l'inscription permettait de choisir son propre rôle, les totaux commerciaux étaient acceptés depuis le client et les transitions de statuts n'étaient pas contrôlées. Aucun test n'était fourni.

## Changements réalisés

### Identité

- Marque renommée en **KRITIA** dans la documentation, Swagger, journaux, paquet et noms Docker.
- Dossier livré sous le nom `kritia-backend`.
- Les identifiants de base Docker ont été renommés ; une migration d'une base existante doit donc être planifiée séparément.

### Authentification et autorisations

- Suppression du rôle dans l'inscription publique : un nouvel utilisateur reçoit le rôle Prisma par défaut `USER`.
- Normalisation des emails en minuscules.
- Politique de mot de passe renforcée pour l'inscription.
- Refus de connexion et de jeton pour les comptes désactivés.
- Secret JWT obligatoire et d'au moins 32 caractères au démarrage.
- Application du `RolesGuard` après authentification sur les contrôleurs concernés ; accès aux utilisateurs et changement de rôle restreints.
- Seed admin sans mot de passe codé en dur (`SEED_ADMIN_PASSWORD` obligatoire).

### Validation, erreurs et calculs

- Correction du `package.json` invalide.
- Validation des enums Prisma, dates, limites de TVA, avancement, quantités et prix.
- Au moins une ligne exigée pour devis et facture.
- Recalcul serveur des totaux HT/TVA/TTC avec arrondi monétaire.
- Réponses 404 explicites pour devis, factures et chantiers absents.
- Filtre d'erreur global avec format stable et masquage du détail des erreurs internes.

### Workflows

- Transitions autorisées explicites pour les statuts de devis et factures.
- Une facture payée/annulée ou un devis transformé/refusé ne peut plus revenir arbitrairement à un état antérieur.
- Les générateurs de numéros restent fondés sur `count + 1` : ils présentent encore un risque de collision en concurrence et devront être remplacés par une séquence transactionnelle.

### DPGF, métrés et bibliothèque — incrément suivant

- Modèle enrichi avec lots/sous-lots, postes de base/options/variantes, formules, coefficients, déboursés, marges et totaux.
- API de création, lecture, sélection, validation et transformation DPGF → devis.
- Moteur de formules sans exécution dynamique de code, avec contrôles et arrondis.
- Bibliothèque d'ouvrages composés (matériau, main-d’œuvre, matériel, sous-traitance) et historique des prix.
- Les imports Excel, écrans et fonctions IA restent à développer ; le backend rénovation est traité dans la phase 2 ci-dessous.

### Rénovation ancienne et cycle commercial — phase 2

- Dossier technique du bâti par zone : pierre, chaux, structure, humidité, charpente, planchers, couverture et réseaux.
- Registre d'aléas avec probabilité, impact, coûts/délais, mesures et transitions contrôlées.
- Travaux conservatoires reliés aux diagnostics et journal de traçabilité terrain en ajout uniquement.
- Pipeline prospect enrichi, visites et conversion transactionnelle en client.
- Réception, réserves, levée avec preuve et passage automatique du chantier à livré.
- SAV ouvert uniquement après réception, avec workflow contrôlé et résolution obligatoire.
- Situations avec retenue recalculée côté serveur, plafond applicatif configurable et ligne de retenue associée.
- Restent à développer : documents/photos dédiés, PV PDF, libération automatisée des retenues et acompte automatique depuis devis.

### Pilotage, documents et compagnon — phase 3

- Budgets par catégorie, dépenses justifiées et engagements issus des commandes et de la sous-traitance.
- Tableau de bord HT : coût réel, main-d’œuvre chargée, coût prévisionnel final, marges et écart budgétaire.
- Affectation de sous-traitants bloquée si les dates de validité URSSAF ou décennale sont absentes/expirées.
- Photos classées avant/pendant/après, réserve ou SAV, avec zone, ouvrage, annotations, géolocalisation et empreinte.
- Documents chantier typés et versionnés pour plans, PV, DOE, diagnostics et pièces commerciales.
- Backend compagnon lié à un employé : pointage idempotent, validation hiérarchique des heures, tâches affectées, photos et bons terrain.
- Permissions du module personnel renforcées ; suppression de photos réservée aux responsables.
- Restent à développer : client PWA hors ligne, stockage/antivirus des fichiers, rapprochement automatique des engagements et génération du DOE.

### Facturation française et audit — phase 4

- Champs structurés de facturation, contrôle de complétude, paiements partiels et avoirs plafonnés.
- Préparation traçable de payloads Factur-X/UBL/CII avec empreinte SHA-256 et choix du canal.
- Aucun envoi vers une plateforme agréée ou Chorus Pro n'est simulé ; les transmissions restent `PREPAREE`.
- Journal d'audit global pour les mutations, sans valeurs sensibles.
- Restent à développer et certifier : PDF/A-3, XML EN 16931, connecteur de plateforme agréée, e-reporting et accusés réels.

### Aide au chiffrage — phase 5

- Moteur déterministe versionné pour omissions, doublons, quantités/prix, totaux, coefficients et marges atypiques.
- Croisement entre diagnostics du bâti ancien et postes réellement chiffrés.
- Suggestions lexicales d'ouvrages et trame par famille de diagnostics.
- Comparaison avec prix, déboursés et quantités de DPGF antérieures utilisant les mêmes ouvrages.
- Historique des analyses avec score de complétude et demandeur.
- Aucune suggestion n'est appliquée automatiquement et aucune fonction générative externe n'est simulée.

### Sécurité et exploitation — phase 6

- JWT d'accès ramené à 15 minutes par défaut et refresh tokens opaques stockés uniquement sous forme d'empreinte SHA-256.
- Rotation atomique des refresh tokens ; une réutilisation ou un token révoqué est refusé.
- Déconnexion d'une session et révocation de toutes les sessions d'un utilisateur.
- Limitation des routes d'inscription, connexion et renouvellement à 10 tentatives par IP/route sur 15 minutes.
- Endpoints de vivacité et readiness PostgreSQL, utilisés par le healthcheck Compose.
- Script de sauvegarde PostgreSQL avec empreinte, permissions restrictives et rétention ; procédure de restauration documentée.
- Conteneur API durci : capacités Linux supprimées, `no-new-privileges`, `/tmp` éphémère et dépendances de développement retirées.
- Limites alors déclarées : la limitation était locale au processus, un access token révoqué reste valide au plus 15 minutes, et le chiffrement hors hôte relève de l'exploitation. La limitation distribuée et la restauration vérifiée ont depuis été traitées en phases 14 et 13.

### Intégrité commerciale — phase 7

- Remplacement de `count + 1` par des séquences annuelles atomiques pour les devis et factures.
- Création du numéro et du document dans une même transaction Prisma.
- Transformation devis accepté → facture avec copie des lignes et montants calculés, changement de statut et création atomiques.
- Relation unique `sourceDevisId` empêchant une double transformation ou une double facturation concurrente.
- Contenu des devis émis rendu immuable et suppression limitée aux brouillons.
- Écritures devis réservées aux rôles de gestion ; lecture maintenue pour les utilisateurs authentifiés.

### Droits, validation et pagination — phase 8

- Ajout du `RolesGuard` et de permissions explicites aux mutations des achats, banque, chantiers, clients, comptabilité, copropriétés, paramètres et planning.
- Suppression des sept charges utiles `any` restantes dans les contrôleurs ; remplacement par des DTO validés.
- Pagination validée et plafonnée à 100 sur clients, devis, factures et chantiers, sans changement du format tableau existant.
- Référence chantier migrée de `count + 1` vers la séquence atomique annuelle déjà utilisée par devis et factures.
- Matrice des droits documentée. Les lectures restent communes aux utilisateurs authentifiés et l'isolation multi-entreprise n'est pas prétendue.

### Gel des factures et concurrence financière — phase 9

- Contrôle de conformité obligatoire lors du passage d'une facture à `ENVOYEE`.
- Instantané JSON immuable, empreinte SHA-256 déterministe et date d'émission conservés dans la transaction.
- Préparation électronique fondée exclusivement sur l'instantané émis ; un brouillon ne peut plus être préparé.
- Annulation directe d'une facture émise interdite : les corrections financières passent par les avoirs.
- Paiements et avoirs protégés par un verrou PostgreSQL sur la facture avant calcul des cumuls.
- Numérotation des avoirs migrée vers une séquence annuelle atomique.
- Limite déclarée : l'empreinte applicative n'est ni une signature qualifiée ni un archivage probant certifié.

### Connecteur de plateforme agréée — phase 10

- Contrat d'adaptateur indépendant du fournisseur et configuration exclusivement par secrets d'environnement.
- Envoi HTTPS avec délai borné, réponse limitée et clé d'idempotence stable.
- Prise en charge atomique des transmissions par l'état `EN_COURS`, relance possible après erreur.
- Historique persistant des tentatives, durées, erreurs et accusés de dépôt avec empreinte SHA-256.
- Refus explicite de tout envoi si aucune plateforme réelle n'est configurée ; aucun résultat externe n'est simulé.
- Limite déclarée : l'adaptation exacte, les callbacks signés et l'interopérabilité restent dépendants du fournisseur qui sera choisi.

### Accusés signés et anti-rejeu — phase 11

- Webhook public isolé, authentifié par HMAC-SHA256 sur horodatage, identifiant d'événement et corps HTTP brut.
- Fenêtre temporelle limitée à cinq minutes, secret d'au moins 32 caractères et comparaison en temps constant.
- Identifiants d'événements et identifiants externes uniques en base pour empêcher les doubles traitements.
- Rapprochement automatique de l'accusé avec la transmission, conservation de la preuve et de son empreinte.
- Transitions limitées à `ACCEPTEE`, `REJETEE` et `ERREUR` ; un état accepté ne peut pas régresser.
- Limite déclarée : le schéma de signature devra être adapté et testé selon la documentation de la plateforme choisie.

### Tests PostgreSQL, CI et migrations — phase 12

- Deux scénarios end-to-end HTTP/PostgreSQL ajoutés pour l'authentification, les rôles, la numérotation et la transformation devis → facture.
- Garde de sécurité refusant toute base de test dont le nom ne se termine pas par `_test`.
- Pipeline GitHub Actions avec PostgreSQL 16, migration, contrôles Node, tests e2e et construction des deux images.
- Conteneur Compose éphémère exécutant les migrations avant le démarrage de l'API.
- Mot de passe manager codé en dur retiré du seed ; secrets admin et manager obligatoires.
- PostgreSQL 16.14 installé localement : migration appliquée et deux scénarios e2e exécutés avec succès.
- Ces tests ont révélé puis permis de corriger l'exposition inter-modules de `JwtService` et la normalisation des dates ISO avant Prisma.
- Docker/Colima exécutés localement : images API et migrateur construites, migration en conteneur réussie et stack Compose vérifiée de bout en bout.
- Les essais Docker ont permis de corriger l'absence de `.dockerignore`, d'OpenSSL Alpine et le chemin d'entrée NestJS dans l'image.

### Sauvegarde et restauration vérifiées — phase 13

- Script de sauvegarde rendu portable macOS/Linux et compatible avec le paramètre Prisma `?schema=public`.
- Écriture atomique via fichier partiel, permissions restrictives avant création et empreinte SHA-256 portable.
- Noms renforcés par timestamp et PID pour éviter les collisions à la seconde.
- Script de restauration isolée avec contrôle d'empreinte, migrations et nombre de tables.
- Barrière destructive : toute base ne se terminant pas par `_restore_test` est refusée avant suppression.
- Profil Compose `maintenance` attendant PostgreSQL et le migrateur avant la sauvegarde.
- Sauvegarde/restauration locale réussie : 1 migration et 72 tables ; sauvegarde Compose vérifiée avec 72 tables.
- CI enrichie d'un cycle sauvegarde → restauration → contrôle.
- Limite déclarée : chiffrement hors hôte, immutabilité et politique RPO/RTO restent à configurer selon l'hébergement.

### Limitation distribuée Redis — phase 14

- Client Redis officiel intégré comme service global optionnel, avec connexion bornée et arrêt propre.
- Compteur atomique partagé par IP/route via script Redis `INCR` + `PEXPIRE` ; les adresses IP ne sont pas stockées en clair dans les clés.
- Seuil maintenu à 10 tentatives sur 15 minutes pour inscription, connexion et renouvellement.
- Refus fermé : lorsque `REDIS_URL` est configurée mais Redis indisponible, les routes protégées et la readiness répondent `503`.
- Repli mémoire conservé uniquement pour les environnements mono-processus sans `REDIS_URL`.
- Redis 7 ajouté aux dépendances et healthchecks de Compose et de GitHub Actions.
- Smoke test Compose réel : readiness Redis `ok`, réponses `401` aux tentatives 1 à 10, `429` à la tentative 11, puis readiness et connexion `503` après arrêt de Redis.

### Concurrence et intégrité financière — phase 15

- Scénarios PostgreSQL simultanés ajoutés pour huit créations de devis, double transformation, double paiement et doubles avoirs.
- Numéros distincts confirmés sous concurrence et une seule transformation autorisée.
- Verrous de facture confirmés : les paiements et avoirs concurrents ne peuvent pas dépasser les totaux.
- Défaut découvert par la recette puis corrigé : conversion de la date ISO du paiement avant écriture Prisma.

### Sécurité et observabilité — phase 16

- Identifiant de requête validé ou généré, retourné dans l'en-tête et dans les erreurs.
- Journaux HTTP structurés en JSON avec durée, statut et utilisateur, sans corps ni secrets.
- Métriques opérationnelles protégées par jeton et désactivées lorsque le jeton n'est pas configuré.
- CORS limité aux origines configurées, méthodes et en-têtes nécessaires.
- URL de photo limitée à HTTP(S), longueurs bornées ; aucun stockage ou antivirus fictif n'est prétendu.
- Healthcheck intégré à l'image, audit npm de production et scan Trivy HIGH/CRITICAL ajoutés à la CI.

### Périmètres d'accès — phase 17

- Listes et fiches chantier filtrées : gestion globale pour administration/management/comptabilité, chantiers responsables pour chefs, chantiers planifiés pour employés.
- Modification d'un chantier hors périmètre explicitement refusée et lecture masquée en 404.
- Photos filtrées avec le même périmètre ; création interdite au rôle `USER`.
- Lectures devis/factures retirées aux rôles non financiers ou non opérationnels concernés.
- Limite déclarée : cette V1 est mono-entreprise. L'isolation SaaS multi-entreprise requiert une migration de données transversale et n'est pas prétendue terminée.

### Recette et livraison — phase 18

- Script de recette refusant une base non suffixée `_test` et enchaînant migration, contrôles Node, e2e, audit production et validation Compose.
- Procédure de déploiement, supervision, recette manuelle et retour arrière applicatif documentée.
- Retour arrière fondé sur une image immuable, sans migration descendante risquée.
- Périmètre réel et dépendances externes explicitement séparés dans `docs/PERIMETRE-V1.md`.

### Docker

- Suppression des mots de passe de production par défaut dans Compose.
- Attente de la disponibilité PostgreSQL par healthcheck.
- Exécution du conteneur final avec l'utilisateur non privilégié `node`.
- Variables nécessaires documentées dans `.env.example`.
- Contexte de build réduit de près de 300 Mo à moins de 1 Mo avec `.dockerignore`.
- OpenSSL installé explicitement pour Prisma dans les images Alpine.
- Ports hôte configurables pour cohabiter avec des services locaux.
- Smoke test Compose réussi : PostgreSQL sain, migration exit 0, API sous utilisateur `node`, healthcheck Docker `healthy` et readiness base `ok`.

### Tests

- Tests unitaires ajoutés pour les calculs de documents et la protection contre les totaux fournis par le client.
- Tests unitaires ajoutés pour le moteur de formules de métrés (calculs, virgule décimale, injection, variable inconnue, division par zéro).
- Tests unitaires ajoutés pour les transitions génériques de workflow.
- Test unitaire ajouté pour les indicateurs de rentabilité chantier.
- Dépendances installées et `package-lock.json` généré.
- Migration contrôlée de NestJS 10 vers NestJS 11 ; dépendances inutilisées retirées.
- `bcrypt` natif remplacé par `bcryptjs`, supprimant la chaîne transitive critique liée à `node-tar`.
- Prisma Client 5.22 généré et schéma validé avec succès.
- Migration PostgreSQL initiale complète régénérée et versionnée. Une base existante nécessite une stratégie de baseline/diff distincte.
- Lint ESLint réussi sans erreur.
- Compilation NestJS réussie.
- 12 suites et 24 tests unitaires réussis, dont signature de webhook et comportements distribué/indisponible de la limitation Redis.
- 1 suite et 5 scénarios end-to-end PostgreSQL réussis après application réelle de la migration, dont concurrence et périmètres d'accès.
- `npm audit` complet, dépendances de développement incluses : **0 vulnérabilité**.
- Docker CLI, Compose et Colima installés ; images API/migrateur et stack Compose testées avec succès localement.
- Image V1 reconstruite et exécutée : migration réussie, readiness PostgreSQL/Redis, métriques authentifiées et utilisateur `node` confirmés. Le scan Trivy est configuré comme barrière CI ; son exécution locale via un conteneur tiers a été écartée afin de ne pas lui exposer le moteur Docker ou le contenu privé de l'image.

## À faire avant production

1. Faire passer la nouvelle CI sur le dépôt et conserver les rapports de scan d'image.
2. Configurer la supervision centralisée et les alertes selon l'hébergeur retenu.
3. Faire signer la recette manuelle par les utilisateurs métier et l'expert-comptable.
4. Ajouter signature, horodatage et archivage probant via un prestataire qualifié si requis contractuellement.
5. Étendre pagination et filtrage aux listes secondaires.
6. Concevoir une migration transversale avant toute évolution multi-entreprise ; la V1 livrée reste mono-entreprise.
7. Brancher le stockage objet et l'antivirus avant d'accepter des fichiers binaires réels.

## Commandes de vérification

```bash
cp .env.example .env
npm install
npx prisma format
npx prisma validate
npx prisma migrate deploy
npm run build
npm test -- --runInBand
docker compose config
docker compose up --build
```
