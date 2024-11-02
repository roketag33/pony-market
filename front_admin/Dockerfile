# Stage de développement
FROM node:18-alpine AS runner

WORKDIR /app

# Installation des dépendances systèmes nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copie des fichiers de configuration
COPY package*.json yarn.lock ./

# Installation des dépendances
RUN yarn install

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 5173

# Commande de développement
CMD ["yarn", "dev", "--host", "0.0.0.0"]