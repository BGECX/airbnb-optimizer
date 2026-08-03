# Rénovation ancienne et cycle commercial — phase 2

## Dossier du bâti existant

Chaque chantier dispose désormais d’un dossier technique séparé des diagnostics réglementaires de copropriété :

- diagnostic par zone, élément, matériau, pathologie, gravité et urgence ;
- éléments spécialisés : fondations, murs en pierre, maçonnerie, enduits à la chaux, charpente, planchers, couverture, humidité et réseaux ;
- registre d’aléas avec probabilité et impact de 1 à 5, coût et délai estimés, mesures et workflow ;
- travaux conservatoires rattachables à un diagnostic ;
- journal de traçabilité pour constats, sondages, déposes, découvertes, modifications, conservation et réemploi.

Le journal de traçabilité est conçu en ajout uniquement dans cette API : aucun endpoint de modification ou suppression n’est exposé.

## Cycle commercial livré

```text
Prospect → visite planifiée → visite réalisée → chiffrage
         → devis demandé → devis envoyé → négociation → gagné/perdu
```

- conversion transactionnelle du prospect gagné en client ;
- visites avec compte rendu et rattachement possible au chantier ;
- réception avec ou sans réserves ;
- levée de chaque réserve avec preuve ;
- passage automatique du chantier à `LIVRE` quand toutes les réserves sont levées ;
- ouverture d’un ticket SAV uniquement après réception ;
- workflow SAV jusqu’à résolution et clôture ;
- situations de travaux avec calcul serveur de la retenue et du net à payer ;
- création automatique d’une ligne de retenue de garantie associée.

## Routes principales

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/chantiers/:id/renovation` | Dossier complet du bâti |
| POST | `/api/chantiers/:id/renovation/diagnostics` | Diagnostic du bâti |
| POST | `/api/chantiers/:id/renovation/aleas` | Déclarer un aléa |
| POST | `/api/chantiers/:id/renovation/travaux-conservatoires` | Travail conservatoire |
| POST | `/api/chantiers/:id/renovation/traces` | Trace terrain immuable |
| POST | `/api/commercial/prospects` | Créer un prospect |
| POST | `/api/commercial/prospects/:id/visites` | Planifier une visite |
| POST | `/api/commercial/prospects/:id/convertir` | Convertir en client |
| POST | `/api/commercial/chantiers/:id/reception` | Réceptionner le chantier |
| POST | `/api/commercial/receptions/:id/reserves` | Ajouter une réserve |
| POST | `/api/commercial/chantiers/:id/sav` | Ouvrir un SAV |
| POST | `/api/commercial/chantiers/:id/situations` | Établir une situation |

## Paramétrage

`MAX_RETENUE_GARANTIE_RATE` fixe le plafond applicatif accepté lors de la saisie d’une retenue. La valeur d’exemple est `5`. Ce paramètre est une règle de validation configurable et ne remplace pas la vérification contractuelle ou juridique propre au marché.

## Limites connues

- Pas encore de stockage documentaire dédié aux photos/preuves des diagnostics, réserves et SAV ; seules les URL et métadonnées prévues sont disponibles.
- Pas encore de génération PDF du procès-verbal de réception.
- Pas encore d’acompte créé automatiquement depuis un devis accepté.
- Pas encore de libération automatisée des retenues à échéance.
- Pas encore de journal d’audit transverse des mutations API.
