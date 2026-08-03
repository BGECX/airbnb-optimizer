#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL est obligatoire}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="${BACKUP_DIR}/kritia-${TIMESTAMP}-$$.dump"
PARTIAL="${TARGET}.partial"
PG_DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/([?&])schema=[^&]*&?/\1/; s/[?&]$//')"

umask 077
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
case "$RETENTION_DAYS" in *[!0-9]*|'') echo "BACKUP_RETENTION_DAYS doit être un entier positif" >&2; exit 1;; esac
trap 'rm -f "$PARTIAL"' EXIT HUP INT TERM
pg_dump "$PG_DATABASE_URL" --format=custom --compress=9 --no-owner --file="$PARTIAL"
mv "$PARTIAL" "$TARGET"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$TARGET" > "${TARGET}.sha256"
else
  shasum -a 256 "$TARGET" > "${TARGET}.sha256"
fi
find "$BACKUP_DIR" -type f -name 'kritia-*.dump' -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -type f -name 'kritia-*.dump.sha256' -mtime "+${RETENTION_DAYS}" -delete
echo "Sauvegarde créée : $TARGET"
