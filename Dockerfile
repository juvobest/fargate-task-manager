# Use official Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (copy package files)
COPY package*.json ./

RUN npm ci --only=production

# Copy app source
COPY . .

# Set environment variables (production friendly)
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["node", "index.js"]
