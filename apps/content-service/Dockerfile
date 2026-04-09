# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/
# Chỉ copy app cần build (content-service)
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

ENV NODE_ENV=production
EXPOSE 8003
CMD ["node", "apps/content-service/dist/main.js"]
