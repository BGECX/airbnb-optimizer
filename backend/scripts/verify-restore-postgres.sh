#!/bin/sh
set -eu

: "${BACKUP_FILE:?BACKUP_FILE est obligatoire}"
: "${ADMIN_DATABASE_URL:?ADMIN_DATABASE_URL est obligatoire}"
: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL est obligatoire}"

test -f "$BACKUP_FILE" || { echo "Archive absente : $BACKUP_FILE" >&2; exit 1; }
test -f "${BACKUP_FILE}.sha256" || { echo "Empreinte absente : ${BACKUP_FILE}.sha256" >&2; exit 1; }

database_path="${RESTORE_DATABASE_URL%%\?*}"
database_name="${database_path##*/}"
case "$database_name" in
  *_restore_test) ;;
  *) echo "Restauration refusée : la base doit se terminer par _restore_test" >&2; exit 1;;
esac
case "$database_name" in *[!a-zA-Z0-9_]*) echo "Nom de base de restauration invalide" >&2; exit 1;; esac

expected="$(awk 'NR == 1 { print $1 }' "${BACKUP_FILE}.sha256")"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$BACKUP_FILE" | awk '{ print $1 }')"
else
  actual="$(shasum -a 256 "$BACKUP_FILE" | awk '{ print $1 }')"
fi
test "$expected" = "$actual" || { echo "Empreinte SHA-256 invalide" >&2; exit 1; }

psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$database_name\" WITH (FORCE)" >/dev/null
psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$database_name\"" >/dev/null
pg_restore --exit-on-error --no-owner --dbname="$RESTORE_DATABASE_URL" "$BACKUP_FILE"

migration_count="$(psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -Atc 'SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')"
table_count="$(psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")"
test "$migration_count" -ge 1 || { echo "Aucune migration Prisma restaurée" >&2; exit 1; }
test "$table_count" -ge 1 || { echo "Aucune table métier restaurée" >&2; exit 1; }

echo "Restauration vérifiée : base=$database_name migrations=$migration_count tables=$table_count sha256=$actual"
