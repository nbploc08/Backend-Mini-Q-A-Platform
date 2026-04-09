# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/
# Chỉ copy app cần build (gateway)
COPY apps/gateway/ apps/gateway/

RUN npm ci --ignore-scripts
RUN npm run build:packages
RUN cd apps/gateway && npx prisma generate && npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=builder /app/apps/gateway/prisma ./apps/gateway/prisma

ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "apps/gateway/dist/main.js"]
