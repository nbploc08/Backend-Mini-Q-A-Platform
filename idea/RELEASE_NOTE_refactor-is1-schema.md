# Release Note

- **Release date**: 01/04/2026
- **Scope**: Content Service (new) + Prisma/seed sync (auth/notification) + workspace scripts
- **Device**: Backend API (NestJS) — content-service, auth-service, notification-service, root workspaces
- **Branch**: `refactor/is1/schema`

## Overview

- **Thêm mới `content-service`** (NestJS) theo pattern core platform (Config envFilePath, NATS, JWT guards, Prisma).
- **Bổ sung seed Prisma** cho `notification-service` và `content-service`, chạy lại nhiều lần được.
- **Mở rộng root scripts** để dev/build/test/prisma:generate hỗ trợ `content-service`.
- **Mở rộng schema `auth-service`** với mô hình outbox để hỗ trợ pattern event/outbox.

## Changes

### Content Service

- **Scaffold service mới** tại `apps/content-service` (NestJS workspace).
- **Bootstrap chuẩn**: `cookieParser`, global validation pipe, exception filter + http logger interceptor từ `@common/core`.
- **Core modules**: `ConfigModule` (envFilePath `['.env','../../.env']`), `NatsModule` (stream `CONTENT_EVENT`), `PermissionModule`, `RateLimiterModule`, `JwtModule`, `PrismaModule`.
- **Prisma schema mới**: `UserReplica`, `Post`, `Question`, `Comment` (self-relation replies), enum `PostStatus`.
- **Seed content**: tạo user replicas + posts + questions + comments + replies; có clean thứ tự an toàn FK để re-run.

### Notification Service

- **Seed Prisma mới**: thêm `prisma/seed.ts` + `prisma/seed/notification.seed.ts` để tạo dữ liệu notification mẫu (re-runnable).
- **Bổ sung script seed**: thêm `prisma:seed` và cấu hình `prisma.seed` trong `package.json` để chạy `prisma db seed`.

### Auth Service

- **Prisma schema**: thêm `OutboxStatus` enum và model `Outbox` (UUID id, topic/eventName/payload, status + retry info + timestamps).

### Monorepo / Workspaces

- **Root scripts**: thêm `dev:content-service`, và include `content-service` vào `build:apps`, `test`, `test:e2e`, `prisma:generate`.

## Migration

- **Migration required**: Yes (for `content-service` and `auth-service` schema changes; `notification-service` adds seed tooling only).
  - `apps/content-service/prisma/schema.prisma` (new)
  - `apps/auth-service/prisma/schema.prisma` (add `Outbox`)

## Dependencies

- **Added**: Không thêm dependency mới ở root; `content-service` workspace thêm các dependency runtime/dev theo pattern NestJS + Prisma.
- **Updated**: `package-lock.json` thay đổi theo workspace mới.

## Affected files (tham khảo)

**Root**

- `.gitignore`
- `package.json`
- `package-lock.json`

**Auth-service**

- `apps/auth-service/prisma/schema.prisma`

**Notification-service**

- `apps/notification-service/package.json`
- `apps/notification-service/prisma/seed.ts`
- `apps/notification-service/prisma/seed/notification.seed.ts`

**Content-service**

- `apps/content-service/**`
