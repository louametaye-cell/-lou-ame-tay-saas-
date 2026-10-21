#!/usr/bin/env bash
# ==============================================================================
# 🛡️ LOU AME TAY ? — SCRIPT DE SAUVEGARDE POSTGRESQL (Linux/macOS/CI)
# DAW Digital Arts Work — by MG
# ==============================================================================
set -e

BACKUP_DIR="./backups/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_louametay_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

# Charger .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

DB_URL="${DIRECT_URL:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "❌ Erreur : DATABASE_URL ou DIRECT_URL introuvable !"
  exit 1
fi

if command -v pg_dump >/dev/null 2>&1; then
  echo "⏳ Exécution de pg_dump vers ${BACKUP_FILE}..."
  pg_dump --dbname="$DB_URL" --clean --if-exists --no-owner --no-privileges -f "$BACKUP_FILE"
  echo "✅ Sauvegarde terminée : ${BACKUP_FILE}"
else
  echo "ℹ️ pg_dump non disponible. Exécution des sauvegardes granulaires multi-tenant..."
  npx tsx scripts/tenant-backup.ts --tenant=madiba-restaurant
  npx tsx scripts/tenant-backup.ts --tenant=anima-pizzeria
  npx tsx scripts/tenant-backup.ts --tenant=sams-prestige
  npx tsx scripts/tenant-backup.ts --tenant=hotel-lat-dior
  echo "✅ Sauvegardes granulaires terminées dans ./backups/tenants/ !"
fi
