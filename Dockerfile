# Use Node.js 18 alpine image
FROM node:18-alpine

# Force rebuild timestamp: 2025-09-23 16:00:00

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Make diagnostic script executable
RUN chmod +x diagnostic.sh

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Run diagnostic script instead of starting server directly
CMD ["./diagnostic.sh"]