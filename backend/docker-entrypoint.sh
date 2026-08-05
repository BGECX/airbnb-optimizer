#!/bin/sh
set -eu

echo "Applying KRITIA database migrations..."
npx prisma migrate deploy

exec "$@"
