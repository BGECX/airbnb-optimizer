# Facturation française et préparation électronique — phase 4

## Positionnement honnête

KRITIA prépare et contrôle les données de facture, mais **n’est pas une plateforme agréée** et ne marque jamais un document comme envoyé sans retour d’un connecteur réel.

## Gel d'émission — phase 9

Le passage de `BROUILLON` à `ENVOYEE` :

- exécute le contrôle de conformité ;
- conserve un instantané JSON des données émetteur, client, facture et lignes ;
- calcule une empreinte SHA-256 déterministe ;
- enregistre la date d'émission dans la même transaction.

La préparation électronique reprend uniquement cet instantané figé. Une facture émise ne peut pas être annulée directement : une correction financière doit passer par un avoir. Il s'agit d'une garantie d'intégrité applicative, pas d'une signature électronique qualifiée ni d'un archivage probant certifié.

Les paiements et avoirs verrouillent la facture en base pendant le contrôle du solde afin d'empêcher deux opérations concurrentes de dépasser le total autorisé. Les avoirs disposent désormais d'une séquence annuelle atomique.

Le calendrier officiel consulté lors de cette livraison prévoit :

- capacité de réception électronique pour toutes les entreprises au 1er septembre 2026 ;
- émission électronique au 1er septembre 2026 pour grandes entreprises et ETI ;
- émission électronique au 1er septembre 2027 pour PME et micro-entreprises.

Source : [Ministère de l’Économie — Tout savoir sur la facturation électronique](https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises).

## Fonctions livrées

- champs structurés supplémentaires : date de prestation, adresse de facturation, référence acheteur et catégorie bien/service/mixte ;
- contrôle de complétude de l’émetteur, du client et du document ;
- paiements partiels avec contrôle du dépassement et passage automatique à `PAYEE` ;
- avoirs plafonnés au montant HT restant de la facture ;
- préparation d’un payload pour `FACTUR_X`, `UBL` ou `CII` ;
- choix de canal : plateforme agréée, Chorus Pro ou export manuel ;
- empreinte SHA-256 et historique des transmissions ;
- statuts distincts `PREPAREE`, `ENVOYEE`, `ACCEPTEE`, `REJETEE`, `ERREUR`.

## Ce qui n’est pas simulé

- aucun PDF/A-3 Factur-X n’est produit dans cette phase ;
- aucun XML EN 16931 n’est déclaré conforme ;
- aucun appel à une plateforme agréée ou à Chorus Pro n’est effectué ;
- aucun statut `ENVOYEE` ou `ACCEPTEE` n’est inventé.

Un connecteur futur devra signer/envoyer le fichier réel, conserver les accusés et piloter les transitions de transmission.

## Journal d’audit

Toutes les requêtes de mutation sont journalisées avec utilisateur, méthode, route, statut HTTP, adresse IP, agent utilisateur, noms de champs et durée. Les valeurs des mots de passe, jetons et secrets ne sont jamais enregistrées.

## Routes

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/factures/:id/conformite` | Contrôle de complétude |
| POST | `/api/factures/:id/paiements` | Paiement partiel ou total |
| POST | `/api/factures/:id/avoirs` | Émission d’un avoir contrôlé |
| POST | `/api/factures/:id/electronique/preparer` | Payload préparatoire et empreinte |
