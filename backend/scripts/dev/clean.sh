#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Nettoyage du dossier dist
if [ -d "dist" ]; then
    log "Suppression du dossier dist..."
    rm -rf dist
fi

# Nettoyage des modules Node
if [ -d "node_modules" ]; then
    log "Suppression des node_modules..."
    rm -rf node_modules
fi

# Nettoyage du cache Yarn
if [ -d ".yarn/cache" ]; then
    log "Nettoyage du cache Yarn..."
    yarn cache clean
fi

# Nettoyage des fichiers temporaires
log "Suppression des fichiers temporaires..."
find . -type f -name "*.log" -delete
find . -type f -name "*.tmp" -delete
find . -type d -name ".DS_Store" -delete

# Nettoyage du cache Prisma
if [ -d "node_modules/.prisma" ]; then
    log "Nettoyage du cache Prisma..."
    rm -rf node_modules/.prisma
fi

# Réinstallation des dépendances
log "Réinstallation des dépendances..."
yarn install

# Régénération des fichiers Prisma
log "Régénération des fichiers Prisma..."
yarn prisma generate

log "Nettoyage terminé avec succès!"