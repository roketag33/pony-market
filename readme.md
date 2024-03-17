# Projet NestJS avec Docker Compose

Ce projet est une configuration de base pour exécuter une application NestJS avec Docker Compose. Il vous permet de développer votre application NestJS dans un environnement Dockerisé et de déployer facilement votre application sur différentes plateformes.

## Configuration du projet

Ce projet utilise Docker Compose pour gérer les conteneurs Docker. Assurez-vous d'avoir Docker et Docker Compose installés sur votre système.

## Structure du projet

- `backend/` : Contient le code source de votre application NestJS.
- `docker/` : Contient les fichiers de configuration Docker pour différents environnements (dev, staging, production).
- `docker-compose.dev.yml` : Fichier de configuration Docker Compose pour le développement.
- `docker-compose.staging.yml` : Fichier de configuration Docker Compose pour la mise en scène (staging).
- `docker-compose.production.yml` : Fichier de configuration Docker Compose pour la production.

## Configuration de l'environnement

Avant de commencer à utiliser ce projet, assurez-vous de créer un fichier `.env` dans le répertoire `backend/` avec les variables d'environnement nécessaires pour votre application NestJS. Vous pouvez vous inspirer du fichier `.env.example` fourni.

## Utilisation du projet en développement

Pour exécuter votre application NestJS en mode développement, utilisez la commande suivante dans le répertoire du projet :

```bash
docker-compose -f docker-compose.dev.yml up --build
