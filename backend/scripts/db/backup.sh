#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Configuration
BACKUP_DIR="/app/backups"
MAX_DAILY_BACKUPS=7
MAX_WEEKLY_BACKUPS=4
MAX_MONTHLY_BACKUPS=3

# Création du dossier de backup si nécessaire
mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly" "$BACKUP_DIR/monthly"

# Nom du fichier de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}.sql"

# Création du backup
log "Création du backup de la base de données..."
PGPASSWORD=$DATABASE_PASSWORD pg_dump \
    -h "$DATABASE_HOST" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    -F c \
    -b \
    -v \
    -f "$BACKUP_DIR/daily/$BACKUP_NAME"

# Rotation des backups quotidiens
log "Rotation des backups quotidiens..."
cd "$BACKUP_DIR/daily" && ls -t | tail -n +$((MAX_DAILY_BACKUPS + 1)) | xargs -r rm

# Gestion des backups hebdomadaires (chaque lundi)
if [ "$(date +%u)" = "1" ]; then
    log "Création du backup hebdomadaire..."
    cp "$BACKUP_DIR/daily/$BACKUP_NAME" "$BACKUP_DIR/weekly/"
    cd "$BACKUP_DIR/weekly" && ls -t | tail -n +$((MAX_WEEKLY_BACKUPS + 1)) | xargs -r rm
fi

# Gestion des backups mensuels (premier du mois)
if [ "$(date +%d)" = "01" ]; then
    log "Création du backup mensuel..."
    cp "$BACKUP_DIR/daily/$BACKUP_NAME" "$BACKUP_DIR/monthly/"
    cd "$BACKUP_DIR/monthly" && ls -t | tail -n +$((MAX_MONTHLY_BACKUPS + 1)) | xargs -r rm
fi

# Vérification de l'espace disque
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -n 1 | awk '{print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -gt 80 ]; then
    log "ATTENTION: L'espace disque utilisé dépasse 80% ($DISK_USAGE%)"
fi

log "Backup terminé avec succès : $BACKUP_NAME"
log "Taille du backup : $(du -h "$BACKUP_DIR/daily/$BACKUP_NAME" | cut -f1)"