# ── Stage 1: Build client ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json for workspaces (if any) and client deps
COPY client/package*.json ./client/
RUN cd client && npm ci --production=false

# Copy client source and build
COPY client/ ./client/
RUN cd client && npm run build

# ── Stage 2: Production server ─────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser -S brajyatra -u 1001

WORKDIR /app

# Copy server package.json and install prod deps only
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server source
COPY server/ ./server/

# Copy built client into server's public directory
COPY --from=builder /app/client/dist ./client/dist

# Copy root-level files
COPY .env.example ./.env.example

# Create data directory for SQLite (will be mounted as volume)
RUN mkdir -p /app/server/agent/data && chown -R brajyatra:nodejs /app

# Switch to non-root user
USER brajyatra

# Expose the unified server port
ENV PORT=5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the unified server
CMD ["node", "server/index.js"]
