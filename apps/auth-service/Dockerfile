# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/

# Copy all workspace package.json for npm workspace resolution
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/notification-service/package.json apps/notification-service/package.json
COPY apps/content-service/package.json apps/content-service/package.json
COPY apps/auth-service/ apps/auth-service/

RUN npm ci --ignore-scripts
RUN npm run build:packages
RUN cd apps/auth-service && npx prisma generate && npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder /app/apps/auth-service/node_modules ./apps/auth-service/node_modules
COPY --from=builder /app/apps/auth-service/prisma ./apps/auth-service/prisma

COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/package.json

ENV NODE_ENV=production
EXPOSE 8001
CMD ["node", "apps/auth-service/dist/src/main.js"]
