# Aide au chiffrage — phase 5

## Nature du moteur

La version `rules-btp-1.0.0` est un moteur déterministe, explicable et testé. Elle ne fait pas appel à un modèle externe et ne prétend pas remplacer le métreur, l’économiste ou le conducteur de travaux.

Chaque analyse est persistée avec sa version, son demandeur, sa date, son score, ses alertes, ses suggestions et sa comparaison historique.

## Contrôles réalisés

- DPGF sans poste sélectionné ;
- quantité ou prix nul ;
- coefficient de vente inférieur à 1 ;
- marge inférieure à 5 % ou supérieure à 80 % ;
- total différent de `quantité × prix unitaire` ;
- désignations potentiellement dupliquées ;
- diagnostic du bâti sans poste correspondant ;
- diagnostic urgent non chiffré remonté comme bloquant.

Ces seuils sont des alertes de gestion configurées dans le moteur, pas des normes légales.

## Suggestions et historique

- classement lexical des ouvrages à partir des désignations, catégories et références ;
- génération d’une trame par famille de diagnostics du chantier ;
- comparaison des prix de vente, déboursés et quantités avec les DPGF historiques utilisant le même ouvrage ;
- score de complétude pénalisé selon le niveau des alertes.

## Routes

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/chiffrage-assiste/dpgf/:id/analyser` | Analyse versionnée |
| GET | `/api/chiffrage-assiste/dpgf/:id/analyses` | Historique des analyses |
| GET | `/api/chiffrage-assiste/ouvrages/suggerer?q=...` | Ouvrages classés |
| GET | `/api/chiffrage-assiste/chantiers/:id/trame` | Trame issue des diagnostics |

## Limites

- La correspondance actuelle est lexicale et ne comprend pas encore les synonymes métier avancés ni les embeddings.
- Les comparaisons historiques exigent des postes rattachés à des ouvrages de bibliothèque.
- Une suggestion n’est jamais ajoutée automatiquement à une DPGF.
- Une future intégration de modèle génératif devra produire une sortie structurée, citer ses éléments sources et rester soumise aux mêmes contrôles déterministes.
