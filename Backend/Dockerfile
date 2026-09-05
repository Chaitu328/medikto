# Use Node.js 22 LTS Alpine image (lean and lightweight)
FROM node:22-alpine

# Install timezone data for Asia/Kolkata
RUN apk add --no-cache tzdata

# Set production environment and timezone
ENV NODE_ENV=production
ENV TZ=Asia/Kolkata
ENV DOCDB_CA_PATH=/app/certs/global-bundle.pem

# Create app directory
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy CA certificate bundle
COPY certs/ ./certs/

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 4000

# Lightweight container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# Start the application with a strict 512 MB Node.js heap limit
CMD ["node", "--max-old-space-size=512", "app.js"]
