# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/
# Chỉ copy app cần build (notification-service)
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

ENV NODE_ENV=production
EXPOSE 8002
CMD ["node", "apps/notification-service/dist/main.js"]
