# Multi-stage build for production optimization
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Development stage
FROM development AS dev
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM development AS build
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy medical protocols JSON BEFORE switching user
RUN mkdir -p ./dist/protocols/data
COPY src/protocols/data/medical-protocols.json ./dist/protocols/data/medical-protocols.json

# Change ownership of all files to nestjs user
RUN chown -R nestjs:nodejs ./dist
RUN chown nestjs:nodejs docker-entrypoint.sh

USER nestjs

EXPOSE 3000

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
