# Use Node.js 22 LTS Alpine image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose application port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
