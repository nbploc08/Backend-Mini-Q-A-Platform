# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/

# Copy all workspace package.json for npm workspace resolution
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/auth-service/package.json apps/auth-service/package.json
COPY apps/notification-service/package.json apps/notification-service/package.json
COPY apps/content-service/ apps/content-service/

RUN npm ci --ignore-scripts
RUN npm run build:packages
RUN cd apps/content-service && npx prisma generate && npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/content-service/dist ./apps/content-service/dist
COPY --from=builder /app/apps/content-service/node_modules ./apps/content-service/node_modules
COPY --from=builder /app/apps/content-service/prisma ./apps/content-service/prisma

COPY --from=builder /app/apps/content-service/package.json ./apps/content-service/package.json

ENV NODE_ENV=production
EXPOSE 8003
CMD ["node", "apps/content-service/dist/src/main.js"]
