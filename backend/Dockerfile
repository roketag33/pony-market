FROM node:18-alpine

WORKDIR /usr/src/app

# Install necessary dependencies
RUN apk add --no-cache \
    build-base \
    python3 \
    netcat-openbsd \
    openssl

# Copy yarn files first
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies with yarn
RUN yarn install

# Copy source
COPY . .

# Generate Prisma Client
RUN yarn prisma generate

# Expose ports
EXPOSE 3000
EXPOSE 9229

# Start development mode with yarn
CMD ["yarn", "start:dev"]