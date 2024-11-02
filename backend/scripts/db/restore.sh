#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Configuration
BACKUP_DIR="/app/backups"
BACKUP_NAME=$1

# Vérification des arguments
if [ -z "$BACKUP_NAME" ]; then
    log "ERROR: Nom du backup non spécifié"
    log "Usage: $0 <nom_du_backup>"
    log "Backups disponibles:"
    find "$BACKUP_DIR" -type f -name "*.sql" -printf "%f\n"
    exit 1
fi

# Vérification de l'existence du backup
BACKUP_PATH=""
for dir in "daily" "weekly" "monthly"; do
    if [ -f "$BACKUP_DIR/$dir/$BACKUP_NAME" ]; then
        BACKUP_PATH="$BACKUP_DIR/$dir/$BACKUP_NAME"
        break
    fi
done

if [ -z "$BACKUP_PATH" ]; then
    log "ERROR: Backup '$BACKUP_NAME' non trouvé"
    log "Backups disponibles:"
    find "$BACKUP_DIR" -type f -name "*.sql" -printf "%f\n"
    exit 1
fi

# Vérification des variables d'environnement
if [ -z "$DATABASE_NAME" ] || [ -z "$DATABASE_USER" ] || [ -z "$DATABASE_PASSWORD" ]; then
    log "ERROR: Variables d'environnement manquantes"
    log "Requis: DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD"
    exit 1
fi

# Confirmation de la restauration
log "ATTENTION: Vous êtes sur le point de restaurer la base de données"
log "Base de données cible: $DATABASE_NAME"
log "Backup source: $BACKUP_PATH"
log "Cette opération va écraser toutes les données existantes"
log "Appuyez sur Ctrl+C pour annuler ou attendez 10 secondes pour continuer..."
sleep 10

# Création d'un backup de sécurité
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
log "Création d'un backup de sécurité: $SAFETY_BACKUP"
PGPASSWORD=$DATABASE_PASSWORD pg_dump \
    -h "$DATABASE_HOST" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    -F c \
    -b \
    -f "$BACKUP_DIR/daily/$SAFETY_BACKUP"

# Déconnexion de tous les utilisateurs
log "Déconnexion de tous les utilisateurs de la base de données..."
PGPASSWORD=$DATABASE_PASSWORD psql \
    -h "$DATABASE_HOST" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DATABASE_NAME' AND pid <> pg_backend_pid();"

# Restauration du backup
log "Début de la restauration..."
PGPASSWORD=$DATABASE_PASSWORD pg_restore \
    -h "$DATABASE_HOST" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    --clean \
    --if-exists \
    -v \
    "$BACKUP_PATH"

# Vérification de la restauration
log "Vérification de la restauration..."
PGPASSWORD=$DATABASE_PASSWORD psql \
    -h "$DATABASE_HOST" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" > /dev/null

if [ $? -eq 0 ]; then
    log "Restauration réussie!"
    log "Un backup de sécurité a été créé: $SAFETY_BACKUP"
else
    log "ERROR: La restauration a échoué"
    log "Vous pouvez restaurer le backup de sécurité: $SAFETY_BACKUP"
    exit 1
fi

# Application des migrations si nécessaire
if [ "$NODE_ENV" = "production" ]; then
    log "Application des migrations post-restauration..."
    yarn prisma migrate deploy
fi

log "Processus de restauration terminé avec succès"
log "N'oubliez pas de vérifier l'application pour vous assurer que tout fonctionne correctement"