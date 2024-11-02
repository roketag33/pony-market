FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs --ingroup nodejs && \
    chown -R nestjs:nodejs /app

# Copie des fichiers de configuration
COPY --chown=nestjs:nodejs package*.json yarn.lock ./

# Installation des dépendances globales nécessaires
RUN yarn global add prisma

# Installation des dépendances du projet
RUN yarn install

# Copie des fichiers Prisma
COPY --chown=nestjs:nodejs prisma ./prisma/

# Génération du client Prisma
RUN yarn prisma:generate

# Copie du reste des fichiers de configuration
COPY --chown=nestjs:nodejs tsconfig*.json ./
COPY --chown=nestjs:nodejs webpack.config.js ./

# Copie du code source
COPY --chown=nestjs:nodejs . .

# Configuration de l'environnement
ENV NODE_ENV=development
ENV PORT=3000

# Exposition des ports
EXPOSE $PORT 9229

# Passage à l'utilisateur non-root
USER nestjs

# Commande de démarrage
CMD ["yarn", "start:dev"]