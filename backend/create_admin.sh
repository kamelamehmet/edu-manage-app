#!/usr/bin/env bash
# Simple helper to create or update a PocketBase superuser using the binary in this repo.
# Usage: ./create_admin.sh email password

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 EMAIL PASSWORD"
  exit 2
fi

EMAIL="$1"
PASS="$2"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PB_BIN="$SCRIPT_DIR/pocketbase"

if [ ! -x "$PB_BIN" ]; then
  echo "pocketbase binary not found or not executable at $PB_BIN"
  echo "Make it executable: chmod +x $PB_BIN"
  exit 3
fi

echo "Creating/updating superuser $EMAIL"
"$PB_BIN" superuser upsert "$EMAIL" "$PASS"

echo "Done."
