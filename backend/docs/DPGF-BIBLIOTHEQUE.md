# DPGF, métrés et bibliothèque — incrément 1

## Périmètre livré

Cet incrément fournit le modèle de données et les API backend pour :

- créer une DPGF rattachée à un chantier ;
- créer des lots et sous-lots ;
- ajouter des postes de base, options ou variantes ;
- alimenter un poste depuis un ouvrage de bibliothèque ;
- saisir des métrés directs, dimensionnels ou par formule ;
- recalculer quantités, déboursés, marges et totaux de vente ;
- sélectionner ou exclure options et variantes ;
- valider puis verrouiller une DPGF ;
- transformer une DPGF validée en devis traçable ;
- composer un ouvrage à partir de matériaux, main-d’œuvre, matériel et sous-traitance ;
- conserver un historique de ses prix.

## Formules de métrés

Les formules acceptent des nombres, variables, parenthèses et opérateurs `+`, `-`, `*`, `/`.

Exemple :

```json
{
  "libelle": "Enduit intérieur hors baies",
  "formule": "(L*H*N)-OUVERTURES",
  "variables": { "L": 4.2, "H": 2.5, "N": 2, "OUVERTURES": 3 },
  "coefficient": 1.05
}
```

Le moteur n’utilise pas `eval`, refuse les symboles inconnus, la division par zéro, les résultats négatifs et les valeurs non finies. Les quantités sont arrondies à trois décimales et les montants à deux.

## Endpoints

| Méthode | Route | Usage |
|---|---|---|
| POST | `/api/dpgf` | Créer une DPGF |
| GET | `/api/dpgf/:id` | Lire l’arbre complet |
| POST | `/api/dpgf/:id/lots` | Ajouter lot/sous-lot |
| POST | `/api/dpgf/lots/:lotId/postes` | Ajouter un poste |
| POST | `/api/dpgf/postes/:posteId/metres` | Ajouter un métré |
| PATCH | `/api/dpgf/postes/:posteId/selection` | Inclure/exclure option ou variante |
| PATCH | `/api/dpgf/:id/statut` | Valider ou archiver |
| POST | `/api/dpgf/:id/devis` | Créer le devis depuis une DPGF validée |
| GET | `/api/bibliotheque/ouvrages` | Rechercher des ouvrages |
| POST | `/api/bibliotheque/ouvrages` | Créer un ouvrage composé |
| POST | `/api/bibliotheque/ouvrages/:id/composants` | Ajouter une ressource et recalculer |
| POST | `/api/bibliotheque/ouvrages/:id/prix` | Enregistrer un nouveau prix historisé |

## Permissions

- Lecture : tout utilisateur authentifié.
- Écriture DPGF et bibliothèque : `ADMIN`, `MANAGER`.
- Remontée de métrés terrain : également `CHEF_CHANTIER`.

## Limites assumées

- Pas encore d’import/export Excel DPGF.
- Pas encore de gestion graphique des formules ni de moteur de règles IA.
- Pas encore de duplication/versionnement automatique d’une DPGF validée.
- La numérotation du devis utilise toujours le mécanisme historique `count + 1`; une séquence transactionnelle reste nécessaire avant forte concurrence.
- La migration doit être générée et relue avec Prisma sur l’environnement cible.
