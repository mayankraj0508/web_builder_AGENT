# Multi-stage Dockerfile for WebAI

# Stage 1: Build Dashboard Frontend
FROM node:18-alpine AS dashboard-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm install
COPY dashboard/ ./
RUN npm run build

# Stage 2: Production Backend & Runner
FROM node:18-alpine
WORKDIR /app

# Install Docker CLI inside container if containerized Docker sandboxing is enabled
RUN apk add --no-cache docker-cli

# Copy root dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend & source files
COPY server/ ./server/
COPY src/ ./src/
COPY tests/ ./tests/
COPY README.md ./

# Copy built frontend assets to server static directory
COPY --from=dashboard-builder /app/dashboard/dist ./dashboard/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Express server & dashboard
CMD ["node", "server/index.js"]
