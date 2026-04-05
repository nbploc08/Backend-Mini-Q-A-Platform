# Release Note

- **Release date**: 05/04/2026
- **Scope**: Content Service (new) + Auth Service (role in login, schema outbox) + Notification Service (schema enum) + Port chuẩn hóa toàn service + Misc
- **Device**: Backend API (NestJS) — content-service, auth-service, notification-service, gateway, packages/common
- **Branch**: `refactor/is1/schema`

## Overview

- **Thêm mới `content-service`** (NestJS) theo pattern core platform (Config, NATS, JWT guards, Prisma, seed).
- **Auth Service**: tích hợp `RolesService` vào `issueTokens` — JWT payload và login response đều mang `roles`; chuẩn hóa `loginResponseDto`; xóa bỏ `as` cast nguy hiểm.
- **Notification Service**: chuẩn hóa schema Prisma — thêm enum `NotificationType`, đổi `data: Json?` → `referenceId: Int?`.
- **Port chuẩn hóa**: tất cả service đổi sang dải `8xxx` (gateway: 8000, auth: 8001, notification: 8002, content: 8003), cập nhật toàn bộ `.env.example`, fallback URL và `PermissionProvider`.
- **Prisma migration** chạy cho cả `auth-service` (outbox) và `content-service` (schema mới).
- **Root**: sửa `lint` script từ `eslint .` → `eslint --fix`.

---

## Changes

### Auth Service

**Role trong login flow**

- `AuthModule`: import và đăng ký `RolesModule`.
- `RolesModule`: export `RolesService` (trước đây chưa export).
- `AuthService.issueTokens`: gọi `roleService.getRolesForUser(user.id)` → đưa `roles` vào JWT payload và vào `loginResponseDto`.
- `AuthService.login`: bỏ cast `return result as loginResponseDto` → `return result` (type-safe hơn).

**loginResponseDto**

- Thêm field `roles: string[]` (có decorator `@IsArray()`, `@IsString({ each: true })`).
- Bỏ toàn bộ `as loginResponseDto` cast — trả object typed trực tiếp.

**Schema / Migration**

- Thêm `OutboxStatus` enum và model `Outbox` (UUID id, topic/eventName/payload, status, retry info + timestamps).
- Migration: `apps/auth-service/prisma/migrations/20260401123527/`.

**Misc**

- `.env.example`: đổi `PORT=3001` → `PORT=8001`; thêm `AUTH_SERVICE_URL=http://localhost:8001`.

---

### Content Service (mới)

- **Scaffold** tại `apps/content-service` (NestJS workspace).
- **Bootstrap**: `cookieParser`, global validation pipe, exception filter + http logger interceptor từ `@common/core`.
- **Core modules**: `ConfigModule` (envFilePath `['.env','../../.env']`), `NatsModule` (stream `CONTENT_EVENT`), `PermissionModule`, `RateLimiterModule`, `JwtModule`, `PrismaModule`.
- **Prisma schema**: `UserReplica`, `Post`, `Question`, `Comment` (self-relation replies), enum `PostStatus`.
- **Seed**: user replicas + posts + questions + comments + replies; clean theo thứ tự FK để re-run an toàn.
- **Migration**: `apps/content-service/prisma/migrations/20260401123759/`.
- `.env.example`: `PORT=8003`.

---

### Notification Service

**Schema Prisma**

- Thêm enum `NotificationType` (`POST_APPROVED`, `POST_REJECTED`, `COMMENT_REPLIED`).
- `Notification.type`: đổi từ `String` → `NotificationType` (enum).
- `Notification.data`: đổi từ `Json?` → `referenceId Int?`.

**Misc**

- `.env.example`: đổi `PORT=3002` → `PORT=8002`; các URL `localhost:3001` → `localhost:8001`.
- `MailsService.sendVerifyCode` + `sendResetPassword`: đổi từ `VERIFY_LINK_BASE_URL` → `AUTH_SERVICE_URL` (fallback `localhost:8001`).

---

### Gateway

- `.env.example`: đổi `PORT=3000` → `PORT=8000`; cập nhật `AUTH_SERVICE_URL=http://localhost:8001`, `NOTIFICATION_SERVICE_URL=http://localhost:8002`; thêm `CONTENT_SERVICE_URL=http://localhost:8003`.
- `AuthClientService` + `RoleClientService`: fallback URL đổi từ `localhost:3001` → `localhost:8001`.
- `main.ts`: bỏ dòng `app.listen` bị duplicate; chuẩn hóa chuỗi log.

---

### packages/common

- `PermissionProvider`: fallback `AUTH_SERVICE_URL` đổi từ `localhost:3001` → `localhost:8001`.

---

### Root

- `package.json`: `lint` script sửa từ `eslint .` → `eslint --fix`.

---

## Migration

**Migration required**: Yes

| Service | Migration |
|---|---|
| `auth-service` | `prisma/migrations/20260401123527/` — thêm `Outbox` model |
| `content-service` | `prisma/migrations/20260401123759/` — schema hoàn toàn mới |
| `notification-service` | Cần `prisma migrate deploy` — đổi `type String` → enum `NotificationType`, đổi `data Json?` → `referenceId Int?` |

> **Lưu ý notification**: bản ghi `Notification` cũ có `type` là string tùy ý sẽ fail migration nếu giá trị không khớp enum. Cần data migration trước.

---

## Dependencies

- **Added**: Không thêm dependency mới ở root; `content-service` workspace dùng các dependency theo pattern NestJS + Prisma.
- **Unchanged**: Các dependency hiện có đủ cho các thay đổi.

---

## Affected files (tham khảo)

**Auth-service**

- `apps/auth-service/.env.example`
- `apps/auth-service/prisma/migrations/20260401123527/`
- `apps/auth-service/src/modules/auth/auth.module.ts`
- `apps/auth-service/src/modules/auth/auth.service.ts`
- `apps/auth-service/src/modules/auth/dto/loginRes.dto.ts`
- `apps/auth-service/src/modules/roles/roles.module.ts`

**Content-service**

- `apps/content-service/**` (toàn bộ — service mới)

**Notification-service**

- `apps/notification-service/.env.example`
- `apps/notification-service/prisma/schema.prisma`
- `apps/notification-service/src/modules/mails/mails.service.ts`

**Gateway**

- `apps/gateway/.env.example`
- `apps/gateway/src/main.ts`
- `apps/gateway/src/modules/client/auth-service/auth/auth-client.service.ts`
- `apps/gateway/src/modules/client/auth-service/role/role-client.service.ts`

**packages/common**

- `packages/common/src/permission/permission.provider.ts`

**Root**

- `package.json`
