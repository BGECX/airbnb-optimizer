# Pilotage chantier et application compagnon — phase 3

## Pilotage économique

Le tableau de bord chantier consolide désormais :

- budget par catégorie de coût ;
- dépenses réellement saisies ;
- coût de main-d’œuvre issu des heures validées et du coût horaire chargé ;
- commandes non annulées et engagements de sous-traitance ;
- chiffre d’affaires facturé hors factures annulées ;
- coût réel, coût prévisionnel final, marge réelle, marge prévisionnelle et écart au budget.

Les catégories sont : matériaux, main-d’œuvre, matériel, sous-traitance, frais généraux, aléas et autres.

L’affectation d’un sous-traitant refuse les dossiers dont les validités URSSAF ou décennale sont absentes ou dépassées. Cette vérification technique ne remplace pas une revue documentaire humaine.

## Photos et documents

Les photos sont classables par :

- phase `AVANT`, `PENDANT`, `APRES`, `RESERVE` ou `SAV` ;
- zone du chantier ;
- ouvrage de bibliothèque ;
- annotations JSON ;
- coordonnées, horodatage et empreinte SHA-256.

Les documents gèrent plans, PV, DOE, diagnostics, devis, factures, bons de livraison et notices. Une nouvelle ressource portant le même nom reçoit automatiquement un numéro de version supérieur.

## Application compagnon

Un compte utilisateur doit être explicitement lié à un employé par `Employe.userId`. Les routes compagnon permettent ensuite :

- consultation du profil et du pointage ouvert ;
- début/fin de pointage avec contrôle de durée ;
- reprise réseau sans doublon grâce à `clientSyncId` ;
- consultation des tâches affectées et mise à jour de leur avancement ;
- photos terrain géolocalisées et annotées ;
- création de bons d’intervention.

Un compagnon ne peut modifier que les tâches auxquelles son identifiant employé est affecté et ne peut clôturer que son propre pointage.
Les heures n’entrent dans la rentabilité qu’après validation par un chef de chantier, manager ou administrateur.

## Routes

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/chantiers/:id/pilotage` | Rentabilité et engagements |
| PUT | `/api/chantiers/:id/pilotage/budgets` | Budget d’une catégorie |
| POST | `/api/chantiers/:id/pilotage/depenses` | Dépense réelle |
| POST | `/api/chantiers/:id/pilotage/sous-traitants` | Affectation contrôlée |
| POST | `/api/chantiers/:id/pilotage/documents` | Document versionné |
| GET | `/api/compagnon/me` | Profil terrain |
| POST | `/api/compagnon/pointages/demarrer` | Début de pointage |
| PATCH | `/api/compagnon/pointages/:id/terminer` | Fin de pointage |
| GET | `/api/compagnon/taches` | Tâches affectées |
| POST | `/api/compagnon/photos` | Photo synchronisable |
| POST | `/api/compagnon/bons` | Bon d’intervention |

## Limites

- Le stockage binaire, le redimensionnement et l’antivirus des fichiers ne sont pas inclus : les API enregistrent des URL et métadonnées.
- Le mode hors connexion côté client/PWA n’est pas livré ; le backend fournit seulement l’idempotence nécessaire à sa synchronisation.
- Les commandes sont comptées comme engagements et les dépenses comme réalisé : le rapprochement automatique doit encore éviter tout double comptage selon la politique comptable retenue.
- La rentabilité est calculée hors TVA et ne constitue pas un état comptable certifié.
