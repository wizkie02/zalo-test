FROM node:18-alpine

# Install Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories and files
RUN mkdir -p zalo_data && \
    touch zalo_data/proxies.json && \
    echo '[]' > zalo_data/proxies.json && \
    touch zalo_data/webhook-config.json && \
    echo '{}' > zalo_data/webhook-config.json

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]