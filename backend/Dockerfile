FROM node:20-alpine AS builder
WORKDIR /app

# Install dev deps to build the TypeScript output
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy built output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/config ./src/config

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
