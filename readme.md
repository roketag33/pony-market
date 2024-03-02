# Projet Adonis.js avec Docker Compose

Ce projet est une configuration de base pour exécuter une application Adonis.js avec Docker Compose. Il vous permet de développer votre application Adonis.js dans un environnement Dockerisé et de déployer facilement votre application sur différentes plateformes.

## Configuration du projet

Ce projet utilise Docker Compose pour gérer les conteneurs Docker. Assurez-vous d'avoir Docker et Docker Compose installés sur votre système.

## Structure du projet

- `backend-api/` : Contient le code source de votre application Adonis.js.
- `docker/` : Contient les fichiers de configuration Docker pour différents environnements (dev, staging, production).
- `docker-compose.dev.yml` : Fichier de configuration Docker Compose pour le développement.
- `docker-compose.staging.yml` : Fichier de configuration Docker Compose pour la mise en scène (staging).
- `docker-compose.production.yml` : Fichier de configuration Docker Compose pour la production.


## Configuration de l'environnement

Avant de commencer à utiliser ce projet, assurez-vous de créer un fichier `.env` dans le répertoire `backend-api/` avec les variables d'environnement nécessaires pour votre application Adonis.js. Vous pouvez vous inspirer du fichier `.env.example` fourni.

## Utilisation du projet en développement

Pour exécuter votre application Adonis.js en mode développement, utilisez la commande suivante dans le répertoire du projet :

```bash
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.staging.yml up --build
docker-compose -f docker-compose.prod.yml up --build
