#!/usr/bin/env bash
#
# backup-sanity.sh — Export the GGI Sanity production dataset and keep the last 5 backups.
#
# Usage:
#   bash scripts/backup-sanity.sh
#
# Run from the project root (ggi-website/).
# Requires: npx, sanity CLI (installed as project dependency or globally)

set -euo pipefail

SANITY_DIR="$(cd "$(dirname "$0")/../sanity" && pwd)"
BACKUP_DIR="${SANITY_DIR}/backups"
DATASET="production"
KEEP=5
TIMESTAMP="$(date +%Y-%m-%d_%H%M)"
FILENAME="production-${TIMESTAMP}.tar.gz"

echo "=== GGI Sanity Backup ==="
echo "Dataset:   ${DATASET}"
echo "Output:    ${BACKUP_DIR}/${FILENAME}"
echo ""

# Create backups directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Run the export
echo "Exporting dataset '${DATASET}'..."
(cd "${SANITY_DIR}" && npx sanity dataset export "${DATASET}" "${BACKUP_DIR}/${FILENAME}")

echo ""
echo "Export complete: ${BACKUP_DIR}/${FILENAME}"

# Remove old backups, keeping only the most recent $KEEP
TOTAL=$(ls -1t "${BACKUP_DIR}"/production-*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
if [ "${TOTAL}" -gt "${KEEP}" ]; then
  DELETE_COUNT=$((TOTAL - KEEP))
  echo ""
  echo "Cleaning up: removing ${DELETE_COUNT} old backup(s) (keeping ${KEEP})..."
  ls -1t "${BACKUP_DIR}"/production-*.tar.gz | tail -n "${DELETE_COUNT}" | while read -r old; do
    echo "  Deleting: $(basename "${old}")"
    rm -f "${old}"
  done
fi

echo ""
echo "=== Current backups ==="
ls -lh "${BACKUP_DIR}"/production-*.tar.gz 2>/dev/null || echo "  (none found)"
echo ""
echo "Done."
