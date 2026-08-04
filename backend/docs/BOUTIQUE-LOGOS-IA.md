# Boutique publicitaire et logos IA

## Périmètre produit retenu

- génération de logos IA dans KRITIA ;
- quota inclus selon l'abonnement et achat de crédits supplémentaires ;
- historique des générations et conservation du logo retenu ;
- retouches simples (texte, couleurs, dimensions et fond) sans nouvel appel IA ;
- déclinaison du logo sur cartes de visite, flyers, panneaux, vêtements et marquage véhicule ;
- comparaison des fournisseurs selon la marge nette, la qualité et le délai ;
- paiement, facture et suivi de commande dans KRITIA ;
- expédition neutre privilégiée, sans promettre un emballage KRITIA si le fournisseur ne le garantit pas.

## État réellement livré

Le module `boutique` expose un catalogue initial, l'état des connecteurs et un moteur de comparaison testé. Le connecteur Gelato appelle son API de devis lorsque `GELATO_API_KEY` est configurée. Cimpress, Printful et Printify sont déclarés comme non actifs tant que leurs contrats et identifiants ne sont pas disponibles.

Le moteur calcule :

`marge nette = prix de vente HT - fabrication - livraison - taxes - frais de paiement - provision SAV`

Il refuse de recommander silencieusement une offre sous le seuil de marge et distingue les devis temps réel des estimations.

## Routes

- `GET /api/boutique/status`
- `GET /api/boutique/catalogue`
- `POST /api/boutique/devis/comparer` (ADMIN ou MANAGER)

## Configuration

`GELATO_API_KEY` active les devis Gelato. La clé doit rester uniquement côté serveur. Aucun achat fournisseur n'est déclenché par la route de comparaison.

## Travaux restant avant vente réelle

1. obtenir les contrats et clés des fournisseurs ;
2. créer la table de correspondance entre le catalogue KRITIA et les références fournisseurs ;
3. créer les modèles persistants des devis, commandes, crédits et mouvements de crédits ;
4. connecter Stripe et confirmer le paiement avant transmission au fournisseur ;
5. implémenter les webhooks de fabrication, livraison, annulation et remboursement ;
6. compléter l'interface boutique et les aperçus d'impression ;
7. fixer juridiquement les CGV, responsabilités SAV et règles de facturation.

La génération de logo déjà présente ne possède pas encore le portefeuille de crédits. Elle ne doit pas être présentée comme illimitée ou facturée tant que ce registre transactionnel n'est pas livré.
