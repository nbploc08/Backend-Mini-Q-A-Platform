# Backend Mini Q&A Platform

## 1. Giới thiệu

**Mini Q&A Platform** là hệ thống backend microservices hoàn chỉnh cho nền tảng hỏi đáp, hỗ trợ đăng bài viết (có duyệt bài), đặt câu hỏi, bình luận, thông báo real-time, và phân quyền RBAC. Dự án được xây dựng dựa trên base có sẵn tại [backend-core-platform](https://github.com/nbploc08/backend-core-platform).

**Tech stack:** NestJS 11 | TypeScript | PostgreSQL 16 (Prisma ORM) | Redis 7 (BullMQ) | NATS JetStream | Socket.IO | Docker

**API Documentation (Swagger):** `http://localhost:8000/api-docs`

---

## 2. Hướng dẫn Setup & Run

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 9+

### Bước 1: Clone & Install

```bash
git clone https://github.com/nbploc08/Backend-Mini-Q-A-Platform.git
cd Backend-Mini-Q-A-Platform
npm install
```

### Bước 2: Khởi động Infrastructure (PostgreSQL, Redis, NATS)

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

### Bước 3: Cấu hình Environment

```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần (mặc định đã hoạt động với Docker dev)
```

Các biến môi trường chính (`.env.example`):

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | Database name | `coredb` |
| `NATS_URL` | NATS connection | `nats://localhost:4222` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `ENCRYPT_KEY` | Shared secret cho encrypt/decrypt (>= 16 chars) | — |
| `LOG_LEVEL` | Log level (info/warn/error) | `info` |

> Xem chi tiết production env tại `.env.prod.example` và `ENV_GUIDE.md`.

### Bước 4: Build packages & Database

```bash
# Build shared packages (@common/core, @contracts/core)
npm run build:packages

# Generate Prisma clients cho tất cả services
npm run prisma:generate

# Chạy migrations (tạo bảng)
npm run prisma:migrate

# Seed data (tạo roles, permissions, admin user, sample data)
npm run prisma:seed
```

### Bước 5: Khởi động Services (4 terminal riêng biệt)

```bash
npm run dev:gateway             # Terminal 1 - Gateway (port 8000)
npm run dev:auth-service        # Terminal 2 - Auth Service (port 8001)
npm run dev:notification-service # Terminal 3 - Notification Service (port 8002)
npm run dev:content-service     # Terminal 4 - Content Service (port 8003)
```

### Production Deployment (Docker)

```bash
npm run build
docker compose -f infra/docker-compose.prod.yml up -d
```

### Port Mapping

| Service | Port | Mô tả |
|---------|------|--------|
| **Gateway** | 8000 | API entry point duy nhất cho client |
| **Auth Service** | 8001 | Authentication & RBAC |
| **Notification Service** | 8002 | Notification & Email |
| **Content Service** | 8003 | Posts, Questions, Comments |
| PostgreSQL | 5433 (dev) / 5432 (prod) | Database |
| Redis | 6379 | Cache, Queue, Rate Limiter |
| NATS | 4222 / 8222 (monitoring) | Message Broker |

---

## 3. Kiến trúc hệ thống

### Tổng quan

Hệ thống sử dụng **API Gateway pattern** — client chỉ giao tiếp với Gateway, Gateway proxy request tới các service phía sau. Các service giao tiếp bất đồng bộ qua **NATS JetStream**.

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP / WebSocket
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Gateway (port 8000)                             │
│  - API Proxy & routing                                       │
│  - JWT verification (user token)                             │
│  - Internal JWT signing (service-to-service)                 │
│  - Rate limiting (Redis sliding window)                      │
│  - Idempotency (IdempotencyRecord in DB)                     │
│  - WebSocket (realtime notification push)                    │
│  - RBAC permission guard                                     │
└──────┬──────────────┬───────────────────┬────────────────────┘
       │ HTTP          │ HTTP              │ HTTP
       ▼              ▼                    ▼
┌────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│auth-service│ │content-service  │ │notification-service  │
│ port 8001  │ │ port 8003       │ │ port 8002            │
│            │ │                 │ │                      │
│ - Register │ │ - Post CRUD     │ │ - NATS consumer      │
│ - Login    │ │ - Moderation    │ │ - BullMQ job queue   │
│ - RBAC     │ │ - Question CRUD │ │ - Email (Gmail SMTP) │
│ - OTP      │ │ - Comment/Reply │ │ - Notification CRUD  │
│ - Password │ │ - Cloudinary    │ │                      │
│   Reset    │ │   upload        │ │                      │
│            │ │ - User Replica  │ │                      │
└──────┬─────┘ └────────┬────────┘ └──────────┬───────────┘
       │                │                      │
       │  Bullmq , Nats (async events)         │
       └──────────────►├───────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │PostgreSQL│     │  Redis  │     │  NATS   │
  │(1 DB,   │     │ (cache, │     │JetStream│
  │4 schemas)│     │ BullMQ, │     │         │
  │          │     │ rate    │     │         │
  │          │     │ limit)  │     │         │
  └─────────┘     └─────────┘     └─────────┘
```

### Chi tiết từng Service

**Gateway** — Điểm vào duy nhất của hệ thống:
- Xác thực JWT token từ client, ký **Internal JWT** riêng (secret khác, audience=`internal`) để gọi service con → service con phân biệt được request từ gateway vs request ngoài.
- Rate limiting bằng **Redis Lua script** (atomic, không race condition).
- Idempotency: client gửi kèm idempotency key → gateway hash request (SHA256), lưu DB, trả cached response nếu trùng.
- WebSocket (Socket.IO): duy trì socket registry (userId → Set\<socketId\>), push notification real-time.
- RBAC guard: fetch permission từ Auth Service (có cache Redis), so sánh với `@RequirePermission()` decorator.

**Auth Service** — Xác thực & phân quyền:
- Register → OTP email verify → Login (access + refresh token).
- Dual JWT: access token (15 phút), refresh token (30 ngày, lưu hash trong DB, gắn deviceId).
- Multi-device session: mỗi lần login tạo deviceId riêng, lưu IP + user agent + browser → hỗ trợ logout từng thiết bị hoặc tất cả.
- RBAC 5 bảng, permission versioning (chi tiết ở mục 5.2).
- Outbox pattern: đảm bảo event publish không mất khi DB transaction fail.

**Content Service** — Quản lý nội dung:
- Post CRUD với moderation workflow (DRAFT → PENDING → APPROVED/REJECTED).
- Question CRUD (public ngay, không cần duyệt).
- Comment polymorphic (comment vào Post hoặc Question, reply 1 cấp).
- Cloudinary integration cho upload ảnh.
- UserReplica: bản sao user data từ Auth Service để tránh cross-service query cho mỗi request.

**Notification Service** — Thông báo bất đồng bộ:
- Consume event từ NATS JetStream ,job worker bullmq (user registered, post approved/rejected, new comment).
- Tạo Notification record trong DB.
- Enqueue email job vào BullMQ → Worker gửi email qua Gmail SMTP.
- Push notification qua WebSocket gateway.

### Tại sao 1 Database, 4 Schema?

Mỗi service sở hữu schema riêng (`auth`, `content`, `notification`, `gateway`) trong cùng 1 PostgreSQL instance. Lý do:
- **Dev/staging đơn giản**: 1 container PostgreSQL, dễ setup, tiết kiệm tài nguyên.
- **Vẫn đảm bảo isolation**: mỗi service chỉ truy cập schema của mình qua Prisma, không cross-schema query.
- **Dễ tách sau này**: khi cần scale, chỉ cần thay `DATABASE_URL` trỏ sang DB riêng — không cần đổi code.

---

## 4. Database Design

### 4.1 Auth Schema

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   UserRole   │     │     Role     │
│─────────────│     │──────────────│     │──────────────│
│ id (UUID)    │◄───│ userId       │     │ id (int)     │
│ email        │     │ roleId       │────►│ name         │
│ passwordHash │     │ assignedAt   │     │ description  │
│ permVersion  │     └──────────────┘     └──────┬───────┘
│ name, phone  │                                  │
│ isActive     │     ┌──────────────────┐  ┌─────┴────────┐
│ createdAt    │     │  RolePermission  │  │  Permission  │
│ updatedAt    │     │──────────────────│  │──────────────│
└──────┬───────┘     │ roleId           │──│ id (int)     │
       │             │ permissionId     │  │ code (unique)│
       │             └──────────────────┘  │ description  │
       │                                   └──────────────┘
       │
       ├──► RefreshToken (tokenHash, deviceId, deviceName, ipAddress, userAgent, expiresAt, revokedAt)
       ├──► EmailOtp (codeHash, expiresAt, isUsed)
       ├──► PasswordReset (tokenHash, expiresAt, used)
```

**RBAC 5-table model**: User ← UserRole → Role ← RolePermission → Permission. Thiết kế này cho phép:
- 1 user có nhiều role, 1 role có nhiều permission.
- Thêm/bớt quyền không cần sửa code, chỉ thao tác DB.
- Permission code dạng `resource:action` (vd: `posts:moderate`, `user:read`, `admin:manage-roles`).

**permVersion**: Integer trên User, tăng mỗi khi quyền thay đổi → dùng để invalidate cache (chi tiết mục 5.2).

### 4.2 Content Schema

```
┌─────────────────┐     ┌─────────────────┐
│   UserReplica   │     │      Post       │
│─────────────────│     │─────────────────│
│ id (from Auth)  │◄────│ authorId        │
│ email           │     │ title, content  │
│ name            │     │ status (enum)   │
│ avatarUrl       │     │   DRAFT         │
└────────┬────────┘     │   PENDING       │
         │              │   APPROVED      │
         │              │   REJECTED      │
         │              │ avatarUrl       │
         │              └────────┬────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │    Comment      │
         │              │─────────────────│
         ├─────────────►│ authorId        │
         │              │ content         │
         │              │ postId (nullable)│◄── Comment on Post
         │              │ questionId (null)│◄── Comment on Question
         │              │ parentId (null)  │◄── Reply (self-ref)
         │              │ replyToId (null) │◄── Reply target
         │              └─────────────────┘
         │
         │              ┌─────────────────┐
         └─────────────►│    Question     │
                        │─────────────────│
                        │ authorId        │
                        │ title, content  │
                        │ avatarUrl       │
                        └─────────────────┘
```

**UserReplica**: Bản sao user data từ Auth Service. Khi Auth Service tạo user mới và được active, nó publish event qua BullMQ → Content Service tạo UserReplica. Mục đích: tránh cross-service HTTP call mỗi khi cần hiển thị tên/avatar tác giả trong danh sách bài viết.

**Polymorphic Comment**: Một comment có thể thuộc Post (`postId`) HOẶC Question (`questionId`), không đồng thời cả hai. Reply 1 cấp qua `parentId` (comment cha) và `replyToId` (comment được reply cụ thể).

### 4.3 Notification Schema

```
Notification
├── id (UUID)
├── userId
├── type (POST_APPROVED | POST_REJECTED | COMMENT_REPLIED | NEW_COMMENT)
├── title, body
├── referenceId        ← ID của entity liên quan (postId, commentId...)
├── readAt (nullable)  ← null = chưa đọc
├── createdAt
└── Index: (userId, readAt, createdAt) ← tối ưu query "unread notifications"
```

### 4.4 Gateway Schema

```
IdempotencyRecord
├── id (UUID)
├── key (unique)       ← Client gửi kèm trong header
├── requestHash        ← SHA256({method, path, body})
├── status (processing | completed | failed)
├── responseStatus, responseBody (JSON)
├── expiresAt (24h)
```

---

## 5. Nghiệp vụ & Logic chính

### 5.1 Authentication Flow

**Register → Verify → Login → Refresh → Logout**

```
1. POST /auth/register
   ├── Validate email uniqueness (case-insensitive, trimmed)
   ├── Hash password với Argon2id (memory: 65536KB, timeCost: 3, parallelism: 4)
   ├── Generate OTP code → hash → encrypt (AES-256-GCM)
   ├── Create user (isActive=false)
   ├── Publish USER_REGISTERED event → NATS → Notification Service gửi email
   └── Return encrypted code

2. POST /auth/register/verify
   ├── Decrypt code, verify hash match + not expired + not used
   ├── Mark OTP as used, set user.isActive=true
   └── User có thể login

3. POST /auth/login
   ├── LocalStrategy: query user by email → argon2.verify(password)
   ├── Extract device info: IP (x-forwarded-for), UA Parser (browser, OS)
   ├── Generate deviceId (UUID)
   ├── Issue Access Token (JWT, 15min) + Refresh Token (JWT, 30 days)
   ├── Hash refresh token → lưu DB với deviceId, IP, userAgent
   ├── Set HttpOnly cookies: refreshToken, deviceId
   └── Return access token + roles trong body

4. POST /auth/refresh
   ├── Extract refreshToken + deviceId từ cookies
   ├── Verify JWT → query DB: userId + deviceId + permVersion + not revoked + not expired
   ├── argon2.verify(storedHash, providedToken)
   └── Issue new token pair, update hash trong DB

5. POST /auth/logout (single device) / POST /auth/logout-all
   ├── Set revokedAt = now() cho session(s)
   └── Clear cookies
```

**Password Reset Flow:**
1. `POST /auth/forgot/password` → generate token, encrypt, enqueue email job (rate limited).
2. `POST /auth/forgot/password/verify` → verify code hash, mark as used.
3. `POST /auth/forgot/password/reset` → hash new password, update user, revoke all sessions.

> **Resend Code**: Rate limited 5/min per IP + 2/min per email → chống brute-force.

### 5.2 RBAC & Permission Versioning

**Luồng kiểm tra quyền (mỗi request):**

```
Request → Gateway JwtAuthGuard → PermissionGuard
                                     │
                                     ▼
                        Có @RequirePermission() decorator?
                          │ Không → Cho phép
                          │ Có
                          ▼
                    Token type = internal?
                          │ Có → Cho phép (trusted service)
                          │ Không (user token)
                          ▼
                   PermissionProvider.getPermissions(userId, permVersion)
                          │
                          ▼
                    Check Redis cache
                    Key: "permissions:user:{userId}"
                    Fields: permVersion (string) + permissions (JSON array)
                          │
                  ┌───────┴───────┐
                  │ Cache hit      │ Cache miss
                  │ + version match│ hoặc version mismatch
                  ▼               ▼
            Return cached    HTTP call Auth Service
            permissions      GET /roles/users/{userId}/permissions
                             (với Internal JWT header)
                                   │
                                   ▼
                             Cache result trong Redis
                             (HSET với permVersion mới)
                                   │
                                   ▼
                        So sánh user permissions vs required permissions
                        (OR logic: user có BẤT KỲ permission nào match → cho phép)
                          │
                  ┌───────┴───────┐
                  │ Match          │ Không match
                  ▼               ▼
              Cho phép        403 Forbidden
```

**Permission Versioning Algorithm** *(giải thuật tự thiết kế)*:

Vấn đề: Khi admin thay đổi role/permission của user, cache cũ vẫn còn hiệu lực → user vẫn giữ quyền cũ cho đến khi cache hết hạn.

Giải pháp: Mỗi User có field `permVersion` (integer). Khi role/permission thay đổi:

```
1. Transaction: update UserRole/RolePermission + increment user.permVersion
2. JWT payload chứa permVersion tại thời điểm sign
3. Mỗi request: Guard so sánh permVersion trong cache vs permVersion trong JWT
   - Match → dùng cache
   - Mismatch → invalidate cache, fetch permission mới từ Auth Service
4. Kết quả: thay đổi quyền có hiệu lực NGAY LẬP TỨC (next request)
```

Ưu điểm so với invalidate toàn bộ cache: chỉ invalidate cache của user bị thay đổi, không ảnh hưởng user khác.

### 5.3 Post Moderation Workflow

**State Machine:**

```
                    ┌─────────┐
          create    │  DRAFT  │
         ────────►  │         │
                    └────┬────┘
                         │ submit
                         ▼
                    ┌─────────┐       approve      ┌──────────┐
                    │ PENDING │ ──────────────────► │ APPROVED │
                    │         │                     │ (public) │
                    └────┬────┘                     └────┬─────┘
                         │                               │
                         │ reject                        │ edit
                         ▼                               │
                    ┌──────────┐                         │
                    │ REJECTED │ ◄───────────────────────┘
                    │          │     (auto-revert to PENDING)
                    └────┬─────┘
                         │ edit
                         │
                         └──────────► PENDING (tự động)
```

**Quy tắc chuyển trạng thái:**
- User tạo bài → `DRAFT` (chỉ author thấy).
- User gửi duyệt (`POST /posts/{id}/submit`) → `PENDING`.
- Edit khi `PENDING` → vẫn giữ `PENDING` (không cần submit lại).
- Edit khi `APPROVED` hoặc `REJECTED` → **tự động chuyển về `PENDING`** (cần admin duyệt lại).
- Chỉ bài `APPROVED` mới hiển thị public.
- Admin approve/reject → **trigger notification bất đồng bộ** qua NATS cho author.
- Chỉ user có permission `posts:moderate` (thường là ADMIN) mới được approve/reject.

### 5.4 Question

User tạo câu hỏi → hiển thị ngay, **không cần qua moderation workflow**. Mọi user đã đăng nhập đều có thể tạo câu hỏi.

### 5.5 Comment & Reply

- Comment vào **Post** hoặc **Question** (polymorphic, mutually exclusive: `postId` XOR `questionId`).
- Reply 1 cấp: `parentId` trỏ tới comment cha, `replyToId` trỏ tới comment cụ thể được reply (hỗ trợ @mention).
- Validation: kiểm tra target entity tồn tại, parent comment tồn tại nếu là reply.

### 5.6 Notification (Bất đồng bộ - BullMQ Job Worker)

**Notification KHÔNG BAO GIỜ xử lý sync trong request.** Toàn bộ luồng:

```
Action xảy ra (approve post, new comment...)
        │
        ▼
Service publish jobs (Bullmq) → redis
        │
        ▼
Notification Service (Bullmq woker nhận jobs)
        │
        ├── Tạo Notification record trong DB
        ├── Emit NOTIFICATION_CREATED → NATS
        │       │
        │       └── Gateway WebSocket listener nhận
        │               │
        │               └── Push real-time tới user qua Socket.IO
        │
        └── Enqueue email job → BullMQ queue
                │
                └── Worker gửi email (Gmail SMTP)
                    ├── attempts: 3
                    ├── backoff: exponential (delay: 2s)
                    └── Failed → Dead Letter Queue (DLQ)
```

**Notification types:** `POST_APPROVED`, `POST_REJECTED`, `COMMENT_REPLIED`, `NEW_COMMENT`, `notification-user-registered`.

### 5.7 Like / Share

- Like/Unlike cho Post hoặc Question.
- Share: tạo shareable link đơn giản.

### 5.8 Upload ảnh

- Upload ảnh qua Cloudinary API (validate type/size).
- Hỗ trợ upload by URL hoặc stream upload from buffer.
- Ảnh được resize (width 150) và lưu trong folder `samples/ecommerce`.

---

## 6. Design Patterns & Kỹ thuật nổi bật

### 6.1 Gateway Pattern
Gateway là điểm vào duy nhất — client không bao giờ gọi trực tiếp service con. Gateway đảm nhiệm: authentication, authorization, rate limiting, idempotency, request routing, WebSocket management. Các service con chỉ nhận request từ gateway (verify bằng Internal JWT).

### 6.2 Event-Driven Architecture (NATS JetStream)
Các service giao tiếp bất đồng bộ qua NATS JetStream. Mỗi event type có stream + durable consumer riêng (vd: stream `AUTH_EVENT`, subject `user.registered`, consumer `notification-user-registered`). Consumer config:
- **Ack policy**: Explicit (manual ack sau khi xử lý thành công)
- **Max deliver**: 3 lần (retry tự động khi `msg.nak()`)
- **Ack wait**: 30 giây
- **Fetch**: batch 5 messages, timeout 5 giây

### 6.3 Outbox Pattern (không làm trong dự án này )
Auth Service lưu event vào bảng `Outbox` cùng transaction với business data → worker riêng publish lên NATS. Đảm bảo: nếu DB transaction fail, event cũng không bị publish (consistency).

### 6.4 Strategy Pattern (Passport)
- **LocalStrategy**: validate email + password (login).
- **UserJwtStrategy**: verify access token (audience=`api`).
- **CombinedJwtStrategy**: decode token trước, kiểm tra audience → chọn secret tương ứng (user secret vs internal secret) → verify.

### 6.5 Decorator Pattern (Custom NestJS Decorators)
- `@RequirePermission(PermissionCode.X)` — khai báo quyền cần thiết cho endpoint.
- `@Public()` — bỏ qua authentication.
- `@RateLimit({ prefix, limit, window, keySource })` — khai báo rate limit rules.
- `@TokenType('user' | 'internal')` — giới hạn token type được phép.
- `@User()` — extract user info từ request.

### 6.6 Observer Pattern (WebSocket)
Gateway duy trì **socket registry** (in-memory Map: userId → Set\<socketId\>). Khi notification mới tạo, NATS event trigger Gateway emit tới tất cả socket của user. Events: `WS_NOTIFICATION_NEW`, `WS_NOTIFICATION_UPDATED`, `WS_NOTIFICATION_READ`.

### 6.7 Fail-Open Pattern
Khi Redis down, rate limiter trả về `{ allowed: true }` thay vì throw error → hệ thống vẫn hoạt động (log warning). Tương tự, permission cache miss không block request mà fallback sang HTTP call.


### 6.8 Monorepo + Shared Kernel Pattern

Dự án sử dụng **kiến trúc Monorepo** (npm workspaces) — tất cả services và shared packages
nằm trong một repository. Code dùng chung được tổ chức theo **Shared Kernel Pattern** (DDD):

- **`@common/core`** — Shared infrastructure: Guards (Permission, RateLimit), Filters
  (HttpException), Security utilities (AES-256-GCM, Argon2), NATS abstraction
  (BaseJetstreamConsumer), Pagination helpers. Các service import trực tiếp thay vì
  duplicate code.

- **`@contracts/core`** — Shared contracts: Event schemas (Zod validation), shared types,
  và constants. Đảm bảo các service "nói cùng ngôn ngữ" khi giao tiếp qua NATS JetStream
  — nếu event schema thay đổi, tất cả service đều được cập nhật tại compile time.

Lợi ích: tránh code duplication, đảm bảo consistency giữa các service, refactor an toàn
(thay đổi shared code → TypeScript compiler báo lỗi ngay ở tất cả service bị ảnh hưởng).
---

## 7. Giải thuật & Kỹ thuật tối ưu Performance

### 7.1 Rate Limiter — Redis Lua Script (Atomic Fixed-Window)

Rate limiting dùng **Lua script** chạy atomic trên Redis, tránh race condition khi nhiều request đồng thời:

```lua
-- Pseudocode của Lua script
local current = redis.call('GET', key)
if current >= limit then
    return {0, current, redis.call('TTL', key)}   -- DENIED
end
redis.call('INCR', key)
if current == nil then
    redis.call('EXPIRE', key, window)              -- Set TTL cho window mới
end
return {1, current + 1, redis.call('TTL', key)}    -- ALLOWED
```

Kết quả trả về: `[allowed, currentCount, ttl]` → Guard set response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`).

Hỗ trợ nhiều rule cùng lúc (vd: 10/min per IP + 5/min per email) → **rule restrictive nhất** quyết định.

### 7.2 Permission Versioning & Cache Invalidation

```
User.permVersion = 5 (hiện tại)
Cache: { permVersion: "5", permissions: ["user:read", "posts:moderate"] }
JWT payload: { permVersion: 5 }

Admin assign thêm role cho user:
1. DB: update permVersion = 6 (atomic trong cùng transaction)
2. Next request: Guard so sánh cache.permVersion (5) vs DB/JWT (6) → MISMATCH
3. Invalidate cache → fetch permission mới → cache với permVersion=6
4. Quyền mới có hiệu lực NGAY (không cần chờ cache TTL)
```

### 7.3 Idempotency — SHA256 Request Hashing

```
Client gửi header: Idempotency-Key: "abc-123"
                                │
                                ▼
Gateway tính: requestHash = SHA256(JSON.stringify({method, path, body}))
                                │
                  ┌─────────────┴──────────────┐
                  │ Key đã tồn tại?             │
                  │                             │
            Có    │                             │ Không
                  ▼                             ▼
        Hash khớp?                    Tạo record status=processing
        │        │                    Thực thi request
     Có │        │ Không              Lưu response, status=completed
        ▼        ▼                    Return response
  status=        409 Conflict
  completed? ──► Return cached response
  processing? ► 409 (đang xử lý)
  failed? ─────► Reset to processing, retry
```

Expiry: 24 giờ. In-memory cache TTL: 5 phút (tránh query DB cho mỗi request).

### 7.4 Token Encryption — AES-256-GCM + Scrypt

OTP code và reset token được encrypt trước khi gửi cho client:
- **Key derivation**: Scrypt từ `ENCRYPT_KEY` + random salt.
- **Encryption**: AES-256-GCM (authenticated encryption) → output: `salt + IV + authTag + ciphertext` → base64.
- Cùng ENCRYPT_KEY trên Auth Service (encrypt) và Notification Service (decrypt để verify).

### 7.5 BullMQ — Job Queue với Exponential Backoff

```
Job enqueue → Worker process
                │
          ┌─────┴──────┐
        Thành công    Thất bại
          │              │
     Remove job    Retry (max 3 lần)
                    Backoff: exponential
                    Delay: 2s → 4s → 8s
                         │
                    Hết retry
                         │
                    Move to DLQ (Dead Letter Queue)
                    Lưu metadata: jobId, data, failedReason, timestamp
```

Queue names: `notification-service` (email jobs), `content-service` (user replica), `content-service-dlq` (failed jobs).

### 7.6 Async Event Processing — BaseJetstreamConsumer

Abstract class cho NATS consumer với consumption loop:

```
onModuleInit():
  1. Ensure stream exists (create if not)
  2. Ensure durable consumer exists (create if not)
  3. Start consumption loop:
     while (!consumeAborted):
       messages = fetch(maxMessages: 5, timeout: 5000ms)
       for msg in messages:
         try:
           await handler(msg.data)
           msg.ack()                    ← Explicit ack
         catch:
           msg.nak()                    ← Redelivery (max 3 lần)
           log.error(...)
```

Graceful shutdown: set `consumeAborted = true` → loop dừng sau batch hiện tại.

---

## 8. API Documentation

### Swagger UI

Truy cập `http://localhost:8000/api-docs` sau khi start Gateway.

### Test nhanh

Sau khi seed, login với tài khoản admin có sẵn:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

### API Endpoint Groups

| Group | Base Path | Mô tả |
|-------|-----------|--------|
| Auth | `/auth/*` | Register, Login, Refresh, Logout, OTP, Password Reset |
| Users | `/users/*` | User CRUD, Profile |
| Roles | `/roles/*` | RBAC management (Admin only) |
| Posts | `/posts/*` | Post CRUD, Submit, Approve/Reject |
| Questions | `/questions/*` | Question CRUD |
| Comments | `/comments/*` | Comment, Reply |
| Notifications | `/notifications/*` | List, Read, Read All |
| Upload | `/upload/*` | Image upload (Cloudinary) |

---

## 9. Giải thích quyết định kỹ thuật (Design Decisions)

| Quyết định | Lý do |
|------------|-------|
| **NestJS** | Module system + DI container mạnh, phù hợp microservices. Decorator-based → khai báo RBAC, rate limit, validation trực tiếp trên controller. |
| **Prisma ORM** | Type-safe query (generated types từ schema), migration system tốt, multi-schema support (`?schema=auth`). |
| **1 DB, 4 Schema** | Đơn giản cho dev/staging, vẫn đảm bảo data isolation. Khi scale → chỉ cần đổi `DATABASE_URL`, không đổi code. |
| **Dual JWT (Access + Refresh)** | Access token ngắn hạn (15min) giảm thiểu rủi ro bị đánh cắp. Refresh token dài hạn (30 ngày) lưu hash trong DB → có thể revoke bất kỳ lúc nào. |
| **Internal JWT** | Gateway ký JWT riêng (secret khác, audience=`internal`) khi gọi service con → service con phân biệt request từ gateway (trusted) vs request ngoài (untrusted). |
| **Permission Versioning** | Chỉ invalidate cache của user bị thay đổi (không flush toàn bộ). Hiệu lực ngay lập tức, không cần chờ cache TTL hết hạn. |
| **Argon2id** (thay vì bcrypt) | Chống GPU/ASIC attack tốt hơn (memory-hard). OWASP khuyến nghị cho password hashing. |
| **BullMQ** (thay vì gửi email trực tiếp) | Tách email sending ra khỏi request flow → response nhanh hơn. Retry tự động với exponential backoff. DLQ cho failed jobs → không mất email. |
| **NATS JetStream** (thay vì RabbitMQ) | Nhẹ, nhanh, built-in persistence (JetStream). Durable consumer + ack/nak + max deliver → reliable delivery. Đơn giản hơn RabbitMQ cho use case này. |
| **Redis Lua script** cho rate limiting | Atomic operation → không race condition. Một lần round-trip tới Redis → performance tốt. |
| **UserReplica** | Tránh cross-service HTTP call mỗi khi cần hiển thị author info. Trade-off: eventual consistency (user đổi tên → replica cập nhật sau). |
| **Outbox Pattern** | Event publish gắn với DB transaction → không bao giờ mất event khi transaction fail. Giải quyết dual-write problem. |

---

## 10. Đề xuất cải thiện Performance

---

## 11. Hướng Scale hệ thống
| **Repository Pattern** | Thêm tầng Repository trừu tượng hóa data access, tách biệt business logic khỏi ORM — chi tiết bên dưới. |



### 6.3 Outbox Pattern (không làm trong dự án này )
Auth Service lưu event vào bảng `Outbox` cùng transaction với business data → worker riêng publish lên NATS. Đảm bảo: nếu DB transaction fail, event cũng không bị publish (consistency).

### Database Scaling
- **Read Replicas**: Tách read/write → write vào primary, read từ replica.
- **Outbox Pattern**:Dùng Outbox Pattern thay việc chỉ tạo job bình thường , Auth Service lưu job vào bảng `Outbox` cùng transaction, dùng cron job để quét các job chưa được đưa lên redis , sau đó đưa lên redis để woker bên content-service nhận và lưu dữ liệu user và user replica . Mục đích: nếu DB transaction fail, event cũng không bị publish (consistency), hoặc DB transaction thành công nhưng job gửi lên redis bị lỗi , tránh việc bất đồng bộ dữ liệu giữa các table


### Monitoring & Observability
- **OpenTelemetry**: Distributed tracing (trace request từ Gateway → Auth → Content → Notification).
- **Prometheus + Grafana**: Metrics (request latency, queue depth, error rate).
- **Structured Logging**: Pino logger với `x-request-id` → trace log across services.

---

## 12. Hướng nâng cấp kiến trúc trong tương lai

| Nâng cấp             | Mô tả                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------|
| **Event Sourcing**   | Lưu toàn bộ state changes dưới dạng event → audit trail, time-travel debugging.               |
| **API Versioning**   | Prefix `/v1/`, `/v2/` → backward compatibility khi thay đổi API.                              |
| **Full-text Search** | Elasticsearch/Meilisearch cho search bài viết/câu hỏi → tốt hơn `LIKE %keyword%`.             |
| **GraphQL Gateway**  | Thay thế REST proxy bằng GraphQL → client query chính xác data cần thiết, giảm over-fetching. |
| **gRPC**             | Thay thế call http đến các service bằng gRPC.                                                 |
|**Repository Pattern**| Thêm tầng Repository giữa Service và Prisma ORM                                                |

---

## 13. Cấu trúc thư mục

```
Backend-Mini-Q-A-Platform/
├── apps/
│   ├── gateway/                 # API Gateway (port 8000)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── client/      # HTTP proxy tới các service
│   │   │   │   ├── internal-jwt/# Ký Internal JWT
│   │   │   │   ├── websocket/   # Socket.IO gateway + registry
│   │   │   │   ├── share/       # Idempotency service
│   │   │   │   └── prisma/
│   │   │   └── main.ts
│   │   └── prisma/schema.prisma # IdempotencyRecord
│   │
│   ├── auth-service/            # Authentication (port 8001)
│   │   ├── src/modules/
│   │   │   ├── auth/            # Login, Register, OTP, Password Reset
│   │   │   ├── users/           # User CRUD
│   │   │   ├── roles/           # RBAC management
│   │   │   ├── jwt/             # CombinedJwtStrategy
│   │   │   ├── queue/           # BullMQ producer
│   │   │   └── user-replica/    # Sync user data
│   │   └── prisma/schema.prisma # User, Role, Permission, Outbox...
│   │
│   ├── content-service/         # Content (port 8003)
│   │   ├── src/modules/
│   │   │   ├── posts/           # Post CRUD + Moderation
│   │   │   ├── questions/       # Question CRUD
│   │   │   ├── comments/        # Comment + Reply
│   │   │   ├── cloudinary/      # Image upload
│   │   │   └── jobs/            # BullMQ worker
│   │   └── prisma/schema.prisma # Post, Question, Comment, UserReplica
│   │
│   └── notification-service/    # Notification (port 8002)
│       ├── src/modules/
│       │   ├── notification/    # Notification CRUD
│       │   ├── mails/           # Gmail SMTP sender
│       │   ├── jetstream/       # NATS consumer
│       │   └── jobs/            # BullMQ email worker
│       └── prisma/schema.prisma # Notification
│
├── packages/
│   ├── common/                  # @common/core - Shared utilities
│   │   └── src/
│   │       ├── permission/      # PermissionGuard, PermissionProvider, Cache
│   │       ├── rate-limiter/    # RateLimiterGuard, Redis Lua script
│   │       ├── nats/            # NatsService, BaseJetstreamConsumer
│   │       ├── errors/          # HttpExceptionFilter, ServiceError
│   │       ├── security/        # crypto.util (AES-256-GCM), password.util (Argon2)
│   │       ├── cls/             # Request context (nestjs-cls)
│   │       └── pagination/      # Pagination helpers
│   │
│   └── contracts/               # @contracts/core - Shared types, event schemas (Zod)
│
├── infra/
│   ├── docker-compose.dev.yml   # PostgreSQL + Redis + NATS (dev)
│   ├── docker-compose.prod.yml  # Full stack (prod)
│   └── sql/init.sql             # CREATE SCHEMA auth, content, notification, gateway
│
├── .env.example                 # Dev environment variables
├── .env.prod.example            # Production environment variables
├── ENV_GUIDE.md                 # Chi tiết từng biến môi trường
└── package.json                 # Monorepo workspace (npm workspaces)
```
