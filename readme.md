# Pony Market - Backend NestJS

Ce projet est une plateforme de marketplace spécialisée dans l'équitation, construite avec NestJS et conteneurisée avec Docker. Il offre une architecture robuste et sécurisée pour gérer les transactions entre vendeurs et acheteurs d'équipement équestre.

## 🚀 Fonctionnalités

- Authentification sécurisée
- Gestion des produits et catégories
- Système de messagerie intégré
- Système de paiement sécurisé
- Gestion des commandes et expéditions
- Cache avec Redis
- Monitoring et logging avancés

## 📁 Structure du Projet

```bash
pony-market/
├── backend/                # Application NestJS
│   ├── src/               # Code source
│   ├── scripts/           # Scripts utilitaires
│   │   ├── docker/       # Scripts Docker
│   │   ├── dev/         # Scripts de développement
│   │   ├── db/          # Scripts base de données
│   │   └── utils/       # Utilitaires
│   ├── prisma/           # Schémas et migrations Prisma
│   └── tests/            # Tests
├── docker/               # Configuration Docker
│   ├── dev/             # Environment de développement
│   ├── staging/         # Environment de staging
│   └── production/      # Environment de production
└── front_admin/         # Interface d'administration
```

## 🛠️ Prérequis

- Docker et Docker Compose
- Node.js 18+
- Yarn
- Git

## 🚦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-repo/pony-market.git
cd pony-market
```

2. Configuration de l'environnement :
```bash
cd docker/dev
cp .env.example .env
```

3. Démarrage en développement :
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 🔧 Scripts Disponibles

### Backend
- `yarn start:dev` : Démarre l'application en mode développement
- `yarn test` : Lance les tests unitaires
- `yarn test:e2e` : Lance les tests end-to-end
- `yarn prisma:generate` : Génère le client Prisma

### Docker
- `docker-compose -f docker-compose.dev.yml up` : Démarre l'environnement de développement
- `docker-compose -f docker-compose.staging.yml up` : Démarre l'environnement de staging
- `docker-compose -f docker-compose.prod.yml up` : Démarre l'environnement de production

## 🔍 Monitoring et Santé

L'application inclut plusieurs endpoints de monitoring :
- `/health` : État général de l'application
- `/health/redis` : État de la connexion Redis
- `/health/db` : État de la base de données

## 🔒 Sécurité

Le projet implémente plusieurs couches de sécurité :
- CORS configuré
- Rate limiting
- Protection contre les injections SQL
- Validation des données
- Authentification JWT
- Headers de sécurité (Helmet)

## 📝 Logs et Monitoring

- Sentry pour le suivi des erreurs
- Logs structurés
- Métriques de performance
- Healthchecks pour tous les services

## 🤝 Contribution

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📜 License

Ce projet est sous licence [MIT](LICENSE).