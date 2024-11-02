#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Nettoyage du dossier dist si nécessaire
if [ -d "dist" ]; then
    log "Nettoyage du dossier dist..."
    rm -rf dist/*
fi

# Configuration du hot reload
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=500
export WATCHPACK_POLLING=true

# Démarrage de l'application
log "Démarrage de l'application en mode développement..."
exec yarn start:dev