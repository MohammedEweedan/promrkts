# Use Node.js 18 LTS
FROM node:18-bullseye-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Compile scripts to JavaScript
RUN npx tsc --project tsconfig.scripts.json --outDir dist/scripts

# Production stage
FROM node:18-bullseye-slim

# Install OpenSSL for Prisma + runtime deps for Puppeteer/Chromium
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libxkbcommon0 \
    libxcb1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy runtime assets needed by the app
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/dist/scripts ./dist/scripts

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port (configurable for different platforms)
EXPOSE 8080
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production
# PORT will be set by the platform (8080 for Fly.io, 10000 for Render)

# Ensure DB schema exists, promote admin, start server; optionally seed in background
CMD ["sh", "-c", "set -e; npx prisma db push; npx prisma generate; node dist/scripts/promote-admin.js; if [ \"${SEED_ON_START}\" = \"1\" ]; then node dist/scripts/seed-realistic-users-fast.js & fi; exec node dist/index.js"]
