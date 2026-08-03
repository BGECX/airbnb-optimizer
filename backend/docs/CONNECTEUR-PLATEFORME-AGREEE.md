# Connecteur de plateforme agréée — phase 10

## Principe

KRITIA ne se déclare pas plateforme agréée. Le backend prépare une transmission figée puis appelle un fournisseur réellement contractualisé à travers un adaptateur HTTP générique.

Sans les trois variables `PA_PROVIDER_NAME`, `PA_SUBMIT_URL` et `PA_API_KEY`, toute tentative d'envoi échoue explicitement avec une indisponibilité de service. Aucun succès fictif n'est enregistré.

## Contrat sortant

L'URL exacte configurée reçoit un `POST` JSON contenant :

- `transmissionId`, également envoyé dans `Idempotency-Key` ;
- `format` (`FACTUR_X`, `UBL` ou `CII`) ;
- `payloadHash` ;
- `payload`, issu de l'instantané figé lors de l'émission.

La réponse doit être un JSON contenant `externalId`, `id` ou `transmissionId`. Une réponse sans identifiant externe est traitée comme un échec. En production, l'URL doit être HTTPS. Le délai est limité à 15 secondes et la réponse à 1 Mo.

Ce contrat est volontairement générique : chaque plateforme possède son authentification, ses routes et son format. Avant production, un adaptateur spécifique devra traduire ce contrat vers l'API choisie et être validé dans son environnement de recette.

## Traçabilité

Pour chaque appel, KRITIA conserve :

- le nombre et la date des tentatives ;
- le succès ou l'erreur tronquée ;
- la durée et, en cas de succès, le code HTTP ;
- l'identifiant externe du fournisseur ;
- l'accusé de dépôt et son empreinte SHA-256.

Une transmission `ERREUR` peut être relancée. La prise en charge atomique par l'état `EN_COURS` empêche deux envois simultanés depuis KRITIA. La clé d'idempotence protège également le rejeu côté fournisseur s'il la prend en charge.

## Endpoints

- `POST /api/factures/:id/electronique/preparer` avec canal `PLATEFORME_AGREEE` ;
- `POST /api/factures/electronique/transmissions/:id/envoyer` ;
- `GET /api/factures/electronique/transmissions/:id` pour les tentatives et preuves.

Restent à réaliser après choix du fournisseur : adaptation exacte de l'API et de son schéma de callback, formats réglementaires certifiés et tests d'interopérabilité en recette.

## Retours signés — phase 11

Le callback est exposé sur `POST /api/integrations/plateforme-agreee/webhook`. Il exige :

- `X-PA-Timestamp` : timestamp Unix en secondes, tolérance maximale de cinq minutes ;
- `X-PA-Event-Id` : identifiant stable et unique de l'événement ;
- `X-PA-Signature` : `sha256=<hex>`, HMAC-SHA256 calculé sur `<timestamp>.<eventId>.<corps brut>` avec `PA_WEBHOOK_SECRET`.

Le secret doit contenir au moins 32 caractères. La comparaison utilise un temps constant. L'identifiant d'événement est unique en base, ce qui rend un rejeu valide mais déjà traité inoffensif.

Corps JSON attendu :

```json
{
  "externalId": "identifiant-retourne-au-depot",
  "status": "ACCEPTEE",
  "occurredAt": "2026-08-03T10:00:00Z",
  "details": {}
}
```

Les statuts acceptés sont `ACCEPTEE`, `REJETEE` et `ERREUR`. Un état accepté ne peut pas régresser. Chaque retour devient une preuve horodatée et hachée. Le format HMAC générique doit être adapté si le fournisseur retenu impose un autre schéma de signature.

Pour une base existante, vérifier et dédoublonner les `identifiant_externe` avant d'appliquer la nouvelle contrainte unique.
