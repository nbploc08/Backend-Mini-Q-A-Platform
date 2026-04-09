# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/

# Copy all workspace package.json for npm workspace resolution
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/auth-service/package.json apps/auth-service/package.json
COPY apps/content-service/package.json apps/content-service/package.json
COPY apps/notification-service/ apps/notification-service/

RUN npm ci --ignore-scripts
RUN npm run build:packages
RUN cd apps/notification-service && npx prisma generate && npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist
COPY --from=builder /app/apps/notification-service/node_modules ./apps/notification-service/node_modules
COPY --from=builder /app/apps/notification-service/prisma ./apps/notification-service/prisma

COPY --from=builder /app/apps/notification-service/package.json ./apps/notification-service/package.json

ENV NODE_ENV=production
EXPOSE 8002
CMD ["node", "apps/notification-service/dist/src/main.js"]
