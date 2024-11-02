# Scripts Docker

Ce dossier contient les scripts nécessaires à la gestion des conteneurs Docker.

## 📜 Scripts disponibles

### healthcheck.sh
Vérifie la santé du conteneur.
```bash
# Utilisation
./healthcheck.sh
# Code de retour 0 si tout va bien, 1 sinon
```

### entrypoint.sh
Point d'entrée principal du conteneur.
```bash
# Utilisation
./entrypoint.sh [command]
```

## ⚙️ Configuration

Les scripts utilisent les variables d'environnement suivantes :
- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `NODE_ENV`

## 📝 Logs

Les logs sont formatés avec timestamp :
```
[2024-11-01 12:00:00] Message
```