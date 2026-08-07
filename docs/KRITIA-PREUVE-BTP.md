# KRITIA Preuve BTP

## Périmètre de la première version

KRITIA Preuve BTP constitue localement la mémoire technique d'un chantier à partir d'une photo ou d'un PDF. Le fichier original ne quitte pas le navigateur et n'est pas stocké par KRITIA.

Le module permet de décrire un fait visible, rattacher le constat à un chantier, calculer une empreinte SHA-256, produire un reçu JSON et un rapport PDF, puis vérifier ultérieurement qu'un fichier possède la même empreinte.

Les parcours couverts sont : état avant travaux, avancement, livraison, travaux supplémentaires, intempérie ou interruption, désordre visible, réserve, levée de réserve et réception.

## Constat visuel amiable

Le constat reste descriptif. Il peut identifier les participants, leurs observations et les éléments visibles, mais ne doit jamais :

- déterminer une cause certaine ;
- attribuer une responsabilité ;
- certifier la conformité des travaux ;
- chiffrer officiellement un préjudice ;
- se présenter comme une expertise judiciaire, technique ou d'assurance.

## Limite actuelle

Cette version ne délivre pas encore d'horodatage qualifié eIDAS. Le raccordement à un prestataire qualifié exige le choix du fournisseur, une contractualisation et ses identifiants techniques. Jusqu'à cette activation, les exports portent explicitement le statut `EMPREINTE_LOCALE_NON_HORODATEE`.

## Conservation

L'utilisateur doit conserver ensemble le fichier original, le reçu JSON et le rapport PDF. KRITIA ne conserve pas le dossier de preuve.
