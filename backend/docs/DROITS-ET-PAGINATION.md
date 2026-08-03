# Droits et pagination — phase 8

## Matrice des mutations historiques

| Domaine | Création / modification | Suppression sensible |
|---|---|---|
| Achats | Admin, manager ou comptable selon la pièce ; chef de chantier pour les livraisons | Non exposée dans ce module |
| Banque | Admin, comptable | Non exposée |
| Chantiers | Admin, manager ; chef de chantier pour le suivi | Admin |
| Clients | Admin, manager | Admin, avec désactivation logique |
| Comptabilité | Admin, comptable | Non exposée |
| Copropriétés | Admin, manager | Admin |
| Paramètres | Admin ; comptable pour TVA et banques | Non exposée |
| Planning Gantt | Admin, manager, chef de chantier | Admin, manager, chef de chantier |

Les lectures restent accessibles à tout utilisateur authentifié dans cette V1. Une future isolation multi-entreprise devra ajouter un filtre de tenant à chaque requête ; elle n'est pas simulée ici.

## Validation

Les anciennes charges utiles `any` des paramètres et copropriétés sont remplacées par des DTO validés. La validation globale avec liste blanche rejette les champs inconnus et contrôle notamment dates, taux, montants et champs obligatoires.

## Pagination

Les listes `clients`, `devis`, `factures` et `chantiers` acceptent :

- `page`, entier supérieur ou égal à 1 ;
- `limit`, entier de 1 à 100 ;
- valeurs par défaut : page 1, 50 éléments.

Le résultat reste un tableau pour ne pas casser le frontend existant. Les métadonnées de total et la pagination par curseur restent à ajouter si les volumes l'exigent.
