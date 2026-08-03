#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL est obligatoire et doit cibler une base _test}"
: "${JWT_SECRET:?JWT_SECRET est obligatoire}"

case "${DATABASE_URL%%\?*}" in *_test) ;; *) echo "Refus : DATABASE_URL doit cibler une base se terminant par _test" >&2; exit 1 ;; esac

npx prisma validate
npx prisma migrate deploy
npm run check
npm run test:e2e -- --runInBand
npm audit --omit=dev --audit-level=high
docker compose config --quiet

echo "Recette automatisée KRITIA réussie"
