# KRITIA Expertise — état livrable

## Disponible

- mission, parties, adresse et autocomplétion via le service national GeoPF ;
- localisation bâtiment, entrée, étage, pièce, zone et accès ;
- vue aérienne Google Maps via un appel serveur (clé non exposée au navigateur) ;
- constatations factuelles séparées de l'analyse professionnelle ;
- portfolio local de 12 photos, avec légendes et contexte ;
- analyse visuelle facultative via OpenAI, après consentement explicite ;
- inclusion d'une analyse IA dans le PDF uniquement après validation par l'expert ;
- rapport PDF avec vue aérienne, constatations, photos, conclusion et réserves.

## Configuration serveur

- `OPENAI_API_KEY` active l'analyse visuelle ;
- `OPENAI_VISION_MODEL` est facultative (valeur par défaut : `gpt-5-mini`) ;
- `GOOGLE_MAPS_API_KEY` active Google Maps Static API. La clé doit autoriser cette API et être restreinte au serveur.

## Limites assumées de cette version

- les projets Expertise ne sont pas encore persistés en base ;
- les photos restent dans le navigateur, sauf envoi ponctuel à OpenAI demandé par l'utilisateur ;
- l'IA ne diagnostique pas et ne valide pas une cause, une conformité ou une responsabilité ;
- l'expert doit relire et retenir explicitement une proposition avant son insertion au rapport ;
- aucune signature électronique qualifiée n'est annoncée dans ce module.
