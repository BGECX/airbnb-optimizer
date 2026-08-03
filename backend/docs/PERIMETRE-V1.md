# Périmètre réel de KRITIA V1

## Livré côté backend

Authentification et rôles, clients, chantiers, devis/factures et workflows contrôlés, paiements/avoirs verrouillés, DPGF et métrés, bibliothèque, rénovation ancienne, pilotage, compagnon, préparation de facturation électronique, audit, sauvegarde/restauration, Redis, Docker, CI et tests essentiels.

Les chantiers sont filtrés pour les chefs responsables et les employés planifiés. Les photos héritent de ce périmètre. Les informations devis et factures sont réservées aux rôles de gestion autorisés.

## Non terminé ou dépendant d'un tiers

- frontend complet et PWA hors ligne ;
- stockage binaire, analyse antivirus et miniatures : l'API V1 ne stocke que des métadonnées et URL HTTP(S) ;
- PDF/A-3 Factur-X certifié et connecteur réel d'une plateforme agréée ;
- génération IA externe ; le moteur actuel est déterministe ;
- signature qualifiée et archivage probant ;
- isolation multi-entreprise : la V1 est explicitement mono-entreprise ;
- validation juridique, fiscale et métier par les professionnels concernés.

Une évolution SaaS multi-entreprise nécessitera une migration dédiée ajoutant un identifiant d'organisation à toutes les données métier, des contraintes composites et des tests d'absence de fuite. Elle ne doit pas être simulée par un simple filtre applicatif.
