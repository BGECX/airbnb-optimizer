# Intégrité commerciale — phase 7

## Numérotation

Les devis et factures utilisent une séquence atomique PostgreSQL par type et par année (`D-2026`, `F-2026`). L'opération `upsert` avec incrément est exécutée dans la même transaction que la création du document. Une transaction annulée peut laisser un trou de numérotation selon l'évolution du mécanisme ; l'unicité et l'absence de doublon priment sur la continuité visuelle.

Format actuel : `D-2026-00001` et `F-2026-00001`.

## Transformation devis vers facture

`POST /api/devis/:id/facture` :

- exige un devis au statut `ACCEPTE` ;
- copie les montants et lignes calculés du devis, sans accepter de totaux du client ;
- crée la facture et passe le devis à `TRANSFORME` dans une transaction unique ;
- enregistre `sourceDevisId` avec une contrainte unique ;
- refuse une seconde transformation, y compris en concurrence.

Le contenu d'un devis qui n'est plus brouillon est désormais immuable. Seul un brouillon peut être supprimé.

## Déploiement sur une base existante

La migration initiale livrée décrit une base neuve. Sur une base KRITIA existante, générer et relire une migration différentielle ajoutant `document_sequences` et `factures.source_devis_id`. Sauvegarder et tester la restauration avant déploiement.
