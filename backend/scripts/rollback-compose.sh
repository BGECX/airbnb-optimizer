#!/bin/sh
set -eu

: "${ROLLBACK_IMAGE:?ROLLBACK_IMAGE doit contenir l'image API immuable à restaurer}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD est obligatoire}"
: "${JWT_SECRET:?JWT_SECRET est obligatoire}"

echo "Restauration applicative vers ${ROLLBACK_IMAGE}. Aucune migration descendante n'est exécutée."
KRITIA_API_IMAGE="$ROLLBACK_IMAGE" docker compose up -d --no-deps api
docker compose ps api
