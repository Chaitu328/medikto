# ==============================================================================
# Medikto Landing Website - Production Multi-Stage Standalone Dockerfile
# Stage 1: Base image (Node.js 22 LTS Alpine)
# Stage 2: Install production & build dependencies
# Stage 3: Build Next.js application with standalone output
# Stage 4: Super-lean production runtime (<120MB image, non-root user)
# ==============================================================================

# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

# ── Stage 2: Dependencies ─────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat tzdata
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 3: Builder ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js production build
RUN npm run build

# ── Stage 4: Production Runner ────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

# Set production environment and timezone
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV TZ=Asia/Kolkata

# Create non-root application user for container security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose internal port
EXPOSE 3000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

# Start Next.js standalone Node server
CMD ["node", "server.js"]
