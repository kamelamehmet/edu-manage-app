#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PB_BIN="$ROOT_DIR/backend/pocketbase"
COL_DIR="$ROOT_DIR/backend/collections-json"
PB_DATA_DIR="$ROOT_DIR/backend/pb_data"

if [ ! -x "$PB_BIN" ]; then
  echo "pocketbase binary not found or not executable at $PB_BIN"
  exit 1
fi

echo "Backing up pb_data to pb_data.bak_$(date +%s)"
cp -r "$PB_DATA_DIR" "$PB_DATA_DIR.bak_$(date +%s)"

echo "Importing collection JSON files (skipping users-extras.json)."
for f in "$COL_DIR"/*.json; do
  base=$(basename "$f")
  if [ "$base" = "users-extras.json" ]; then
    echo "Skipping $base (do not auto-import the system users collection)."
    continue
  fi
  echo "Importing $base..."
  "$PB_BIN" collections import "$f"
done

echo "Done. Review the server logs and open the Admin UI to confirm the collections."
