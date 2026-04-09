# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/
# Chỉ copy app cần build (auth-service)
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

ENV NODE_ENV=production
EXPOSE 8001
CMD ["node", "apps/auth-service/dist/main.js"]
