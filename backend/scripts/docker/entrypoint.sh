#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Nettoyage et préparation du dossier dist
log "Préparation du dossier dist..."
rm -rf dist/*
mkdir -p dist

# Attente de la base de données
log "Attente de la disponibilité de la base de données..."
while ! nc -z ${DATABASE_HOST:-db_dev} ${DATABASE_PORT:-5432}; do
    log "Base de données indisponible - en attente"
    sleep 2
done
log "Base de données disponible!"

# Application des migrations
if [ "$NODE_ENV" = "production" ]; then
    log "Application des migrations..."
    yarn prisma migrate deploy
fi

# Démarrage de l'application
log "Démarrage de l'application..."
exec "$@"