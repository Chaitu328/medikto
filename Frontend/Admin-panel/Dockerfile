# ==============================================================================
# Medikto Admin Panel - Production Multi-Stage Dockerfile
# Stage 1: Build the React/Vite application with Node.js
# Stage 2: Serve static production assets with lightweight Nginx Alpine (<20MB RAM)
# ==============================================================================

# ── Stage 1: Build Stage ──────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time environment variable for Vite
ARG VITE_API_BASE_URL=https://api-prd.medikto.com/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies using package-lock.json for clean, deterministic builds
COPY package*.json ./
RUN npm ci

# Copy source files and compile production bundle
COPY . .
RUN npm run build

# ── Stage 2: Production Runtime Stage ─────────────────────────────────────────
FROM nginx:alpine

# Copy custom Nginx configuration (SPA routing + security headers + asset caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose container Nginx port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
