# ═══════════════════════════════════════════════════════
#  SecureBank – Server Dockerfile
#  Optimized Node.js production image
# ═══════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S securebank -u 1001 -G nodejs && \
    chown -R securebank:nodejs /app

USER securebank

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
