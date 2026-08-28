#!/bin/bash
# ==============================================================================
# SCRIPT DE SAUVEGARDE AUTOMATIQUE QUOTIDIENNE MYSQL (LOU AME TAY ? - SÉNÉGAL)
# RTO < 30 minutes • Dump compressé et rétention 30 jours
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/louametay"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="louametay_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "------------------------------------------------------------"
echo "🗄️ [BACKUP AUTOMATISÉ] Démarrage de la sauvegarde MySQL..."

# Exécution du mysqldump depuis le conteneur Docker
docker exec louametay_mysql_prod mysqldump -u louametay_user -pSecur3Passw0rd_Dakar2026! louametay_prod | gzip > "${BACKUP_DIR}/${BACKUP_FILENAME}"

FILESIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILENAME}" | cut -f1)
echo "✅ Sauvegarde réussie : ${BACKUP_FILENAME} (${FILESIZE})"

# Nettoyage des anciennes sauvegardes (> 30 jours)
find "$BACKUP_DIR" -type f -name "louametay_backup_*.sql.gz" -mtime +30 -delete
echo "🧹 Nettoyage des sauvegardes de plus de 30 jours effectué."

# Enregistrement dans le journal d'audit
curl -s -X POST http://localhost:3000/api/admin/audit-logs \
  -H "Content-Type: application/json" \
  -d "{\"actorName\":\"System Backup Daemon\",\"actorRole\":\"SYSTEM\",\"action\":\"DATABASE_BACKUP\",\"targetResource\":\"MySQL Production DB\",\"details\":\"Sauvegarde quotidienne créée avec succès : ${BACKUP_FILENAME} (${FILESIZE})\"}" || true

echo "------------------------------------------------------------"
