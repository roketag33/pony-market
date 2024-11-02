#!/bin/bash
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Vérification des droits d'exécution
if [ ! -x "$(command -v chmod)" ]; then
    log "ERROR: chmod n'est pas disponible"
    exit 1
fi

# Création des dossiers nécessaires
log "Création des dossiers de scripts..."
mkdir -p scripts/{docker,dev,db,utils}

# Attribution des permissions
log "Configuration des permissions..."
find scripts -type f -name "*.sh" -exec chmod +x {} \;

# Vérification de l'environnement
log "Vérification de l'environnement de développement..."
if [ ! -f .env ]; then
    log "Création du fichier .env..."
    cp .env.example .env
fi

# Installation des dépendances
log "Installation des dépendances..."
yarn install

# Génération des fichiers Prisma
log "Génération des fichiers Prisma..."
yarn prisma generate

log "Configuration du développement terminée!"
log "Vous pouvez maintenant lancer l'application avec: docker-compose -f docker-compose.dev.yml up --build"