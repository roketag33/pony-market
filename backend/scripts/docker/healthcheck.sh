#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de nettoyage
cleanup() {
    log "Arrêt gracieux du conteneur..."
    trap - SIGTERM SIGINT
    kill -TERM "$child" 2>/dev/null
}

# Gestion des signaux
trap cleanup SIGTERM SIGINT

# Vérification des variables d'environnement requises
if [ -z "$DATABASE_URL" ]; then
    log "ERROR: DATABASE_URL n'est pas défini"
    exit 1
fi

if [ -z "$NODE_ENV" ]; then
    log "ERROR: NODE_ENV n'est pas défini"
    exit 1
fi

# Fonction pour vérifier la disponibilité d'un service
check_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_tries=$4
    local count=0

    log "Attente de la disponibilité de $service..."
    while ! nc -z "$host" "$port" > /dev/null 2>&1; do
        count=$((count + 1))
        if [ $count -gt "$max_tries" ]; then
            log "ERROR: $service n'est pas disponible après $max_tries tentatives"
            exit 1
        fi
        log "Tentative $count/$max_tries - $service non disponible, nouvelle tentative dans 2 secondes..."
        sleep 2
    done
    log "$service est disponible!"
}

# Vérification des services
check_service "${DATABASE_HOST:-db_dev}" "${DATABASE_PORT:-5432}" "Base de données" 30
check_service "${REDIS_HOST:-redis}" "${REDIS_PORT:-6379}" "Redis" 15

# Préparation du dossier dist
if [ "$NODE_ENV" = "development" ]; then
    log "Configuration du mode développement..."
    if [ -d "dist" ]; then
        log "Nettoyage du dossier dist..."
        rm -rf dist/*
    fi
    mkdir -p dist
    chown -R nestjs:nodejs dist
fi

# Application des migrations en production
if [ "$NODE_ENV" = "production" ]; then
    log "Application des migrations de base de données..."
    yarn prisma migrate deploy
fi

# Vérification des permissions
log "Vérification des permissions..."
chown -R nestjs:nodejs /app/node_modules/.prisma
chmod -R 755 /app/node_modules/.prisma

# Démarrage de l'application
log "Démarrage de l'application en mode $NODE_ENV..."
exec "$@" &
child=$!
wait "$child"