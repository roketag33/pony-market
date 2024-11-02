# Scripts Utilitaires

Ce dossier contient tous les scripts nécessaires au fonctionnement et à la maintenance de l'application.

## 📁 Structure

```bash
scripts/
├── docker/            # Scripts liés à Docker
│   ├── healthcheck.sh  # Vérification de santé des conteneurs
│   └── entrypoint.sh  # Point d'entrée des conteneurs
├── dev/              # Scripts de développement
│   ├── start.sh       # Démarrage en développement
│   └── clean.sh       # Nettoyage de l'environnement
├── db/               # Scripts base de données
│   ├── backup.sh      # Sauvegarde de la base
│   └── restore.sh     # Restauration de la base
└── utils/            # Utilitaires généraux
    ├── check-env.sh   # Vérification de l'environnement
    └── setup-dev.sh   # Configuration du développement
```

## 🚀 Scripts Docker

### healthcheck.sh
Vérifie la santé du conteneur en contrôlant :
- La disponibilité de l'API
- L'utilisation mémoire
- L'utilisation CPU
- L'espace disque
- La connexion à la base de données

### entrypoint.sh
Point d'entrée du conteneur qui :
- Attend la disponibilité de la base de données
- Applique les migrations si nécessaire
- Démarre l'application

## 🛠️ Scripts de Développement

### start.sh
- Nettoie le dossier dist
- Configure les permissions
- Démarre l'application en mode développement

### clean.sh
- Nettoie les fichiers temporaires
- Réinitialise l'environnement

## 💾 Scripts Base de Données

### backup.sh
- Crée une sauvegarde de la base de données
- Gère la rotation des sauvegardes

### restore.sh
- Restaure une sauvegarde spécifique
- Vérifie l'intégrité des données

## ⚙️ Utilitaires

### check-env.sh
- Vérifie les variables d'environnement
- Valide la configuration

### setup-dev.sh
- Configure l'environnement de développement
- Installe les dépendances
- Génère les fichiers nécessaires

## 📝 Usage

Tous les scripts doivent être exécutables :
```bash
chmod +x scripts/**/*.sh
```

Pour exécuter un script :
```bash
./scripts/category/script.sh
```

## ⚠️ Notes importantes

1. Tous les scripts utilisent `/bin/sh` pour la compatibilité
2. Les variables d'environnement doivent être configurées
3. Les scripts nécessitent les permissions appropriées
4. Certains scripts nécessitent des droits sudo