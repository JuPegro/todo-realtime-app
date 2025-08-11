# Multi-stage build for optimal size and security
FROM node:18-alpine AS development

# Install system dependencies
RUN apk add --no-cache openssl curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Development stage
FROM development AS dev
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM development AS build

# Build the application
RUN npm run build
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache openssl curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application and dependencies
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["sh", "-c", "npx prisma db push && npx prisma generate && npm run start:prod"]