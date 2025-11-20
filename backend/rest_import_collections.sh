#!/usr/bin/env bash
set -euo pipefail

# REST-based importer for PocketBase collections JSON templates.
# Usage: ./rest_import_collections.sh [ADMIN_EMAIL] [ADMIN_PASS]
# If no args provided, defaults to the admin created earlier.

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PB_BIN="$ROOT_DIR/backend/pocketbase"
COL_DIR="$ROOT_DIR/backend/collections-json"
PB_DATA_DIR="$ROOT_DIR/backend/pb_data"

ADMIN_EMAIL=${1:-mehmetkamela14@gmail.com}
ADMIN_PASS=${2:-kamela14}

API_URL=${PB_API_URL:-http://127.0.0.1:8090}

if ! curl -sS "$API_URL/" >/dev/null 2>&1; then
  echo "PocketBase server not reachable at $API_URL. Start it first: cd backend && ./pocketbase serve"
  exit 1
fi

TIMESTAMP=$(date +%s)
BK="$PB_DATA_DIR.bak_$TIMESTAMP"
echo "Backing up pb_data to $BK"
cp -r "$PB_DATA_DIR" "$BK"

COOKIEJAR=$(mktemp)
echo "Authenticating admin $ADMIN_EMAIL"
auth_resp=$(curl -s -c "$COOKIEJAR" -X POST "$API_URL/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASS\"}")

if echo "$auth_resp" | grep -q "error"; then
  echo "Admin auth failed:" >&2
  echo "$auth_resp" >&2
  rm -f "$COOKIEJAR"
  exit 2
fi

echo "Authenticated. Importing collections (skipping users-extras.json)."
for f in "$COL_DIR"/*.json; do
  base=$(basename "$f")
  if [ "$base" = "users-extras.json" ]; then
    echo "Skipping $base (do not auto-import the system users collection)."
    continue
  fi

  echo "Importing $base..."
  http_code=$(curl -s -b "$COOKIEJAR" -o /tmp/import_resp -w "%{http_code}" -X POST "$API_URL/api/collections" \
    -H "Content-Type: application/json" --data-binary "@$f" ) || true

  echo "HTTP $http_code"
  cat /tmp/import_resp || true
  echo

  if [ "$http_code" -ge 400 ]; then
    echo "Import of $base returned HTTP $http_code. Stopping to avoid partial state." >&2
    rm -f "$COOKIEJAR"
    exit 3
  fi
done

echo "Import finished. Collections created. Clean up cookie jar."
rm -f "$COOKIEJAR"
echo "Done. Please restart PocketBase if needed and verify collections in the Admin UI."
