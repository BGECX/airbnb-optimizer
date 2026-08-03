# Recette KRITIA V1

## Contrôles automatisés

La commande `scripts/release-check.sh` valide Prisma, les migrations, le lint, la compilation, les tests unitaires et PostgreSQL, l'audit npm de production et la configuration Compose. La CI ajoute la construction et le scan Trivy de l'image.

Scénarios couverts automatiquement : inscription et rôle par défaut, rotation et anti-rejeu des sessions, permissions, numérotation concurrente, transformation unique devis → facture, plafonds concurrents des paiements et avoirs, périmètre chantier, Redis partagé et refus fermé.

## Recette manuelle obligatoire

- créer un client, un chantier et un devis comportant plusieurs taux/cas d'arrondi ;
- parcourir les transitions commerciales permises et interdites ;
- vérifier un acompte, une situation, une retenue, une réception et un SAV ;
- créer une DPGF avec formules, option et variante puis la transformer ;
- tester chaque rôle avec des données affectées et non affectées ;
- vérifier les photos/documentations avec le stockage réel retenu ;
- vérifier sauvegarde, restauration isolée et retour applicatif ;
- valider les mentions de facturation avec l'expert-comptable ;
- faire accepter ergonomie et résultats par un utilisateur métier.

## Critère de décision

La V1 est techniquement candidate au déploiement lorsque tous les contrôles automatisés passent et que la recette manuelle est signée. Le présent dépôt ne constitue ni une certification Factur-X, ni une homologation fiscale, ni une validation métier à la place de l'entreprise.
