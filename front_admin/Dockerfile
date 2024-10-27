# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies with cache mounting
RUN yarn install

# Change ownership of node_modules to non-root user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose Vite dev server port
EXPOSE 7173

# Start Vite dev server with host flag to allow external access
CMD ["yarn", "run", "dev", "--host"]