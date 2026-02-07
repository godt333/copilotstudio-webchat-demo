FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for tsx)
RUN npm ci

# Copy source files
COPY src/ ./src/
COPY tsconfig.json ./

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the server with tsx (no build needed)
CMD ["npx", "tsx", "src/index.ts"]
