# Backend-Mini-Q-A-Platform

## 1. Giới thiệu

Mini Q&A Platform là hệ thống backend microservices cho bài test Backend Assignment, đáp ứng đầy đủ các yêu cầu về moderation workflow, phân quyền RBAC, notification bất đồng bộ, và kiến trúc hiện đại. Dự án sử dụng NestJS, PostgreSQL (Prisma ORM), Redis (BullMQ), Docker, triển khai theo mô hình microservices.

## 2. Kiến trúc hệ thống

- **Gateway**: Xác thực JWT, RBAC, rate limiting, WebSocket, proxy HTTP tới các service con.
- **Auth Service**: Đăng ký, đăng nhập, RBAC, quản lý user, JWT, permission versioning.
- **Content Service**: Quản lý Post (có duyệt), Question (không duyệt), Comment/Reply, Like/Share.
- **Notification Service**: Notification bất đồng bộ, gửi email qua BullMQ, real-time WebSocket.
- **Database**: PostgreSQL 16, mỗi service 1 schema riêng biệt.
- **Redis**: Cache, BullMQ queue, rate limiter.
- **NATS JetStream**: Event bus cho các event như post.approved, notification.created.

```
Client ⇄ Gateway ⇄ (Auth, Content, Notification)
         │         │         │
         └─────────┴─────────┘
         PostgreSQL, Redis, NATS
```

## 3. Yêu cầu nghiệp vụ & Logic chính

### 3.1 Authentication & RBAC
- Roles: `USER`, `ADMIN` (RBAC 5 bảng: User, UserRole, Role, RolePermission, Permission)
- Chỉ ADMIN mới được duyệt bài viết (approve/reject)
- Permission code dạng `resource:action` (vd: `posts:moderate`)
- Permission versioning: đổi quyền → invalidate cache, JWT tự phát hiện

### 3.2 Post Moderation Workflow
- User tạo bài → mặc định `DRAFT`
- Gửi duyệt → `PENDING`
- Edit khi `PENDING` → vẫn giữ `PENDING`
- Edit khi `APPROVED`/`REJECTED` → tự động chuyển về `PENDING`
- Chỉ bài `APPROVED` mới public
- Admin approve/reject → trigger notification cho author (bất đồng bộ)

### 3.3 Question
- User tạo câu hỏi → hiển thị ngay, không cần duyệt

### 3.4 Comment & Reply
- Comment vào Post hoặc Question (polymorphic)
- Hỗ trợ reply 1 cấp (parentId, replyToId)

### 3.5 Notification (BẮT BUỘC async)
- Trigger khi: post được approve/reject, comment mới, (optional: mention)
- Sử dụng Redis + BullMQ, không xử lý sync trong request
- Luồng: Action → NATS event → Notification Service → DB + enqueue email → BullMQ worker gửi email

### 3.6 Like/Share
- Like/Unlike cho Post/Question, share đơn giản dạng link

### 3.7 Upload ảnh
- Upload ảnh cho Post, validate type/size

## 4. Database Schema (Prisma)
- User, Role, Permission, UserRole, RolePermission
- Post (status: DRAFT, PENDING, APPROVED, REJECTED)
- Question
- Comment (postId/questionId, parentId, replyToId)
- Notification (type, title, body, referenceId, readAt)

## 5. Kỹ thuật & Design Pattern nổi bật
- **Gateway pattern** (API Gateway, proxy, WebSocket)
- **Event-driven** (NATS JetStream, Outbox)
- **Repository pattern** (Prisma)
- **RBAC** (permission versioning, cache, invalidate)
- **BullMQ** (job queue, retry, exponential backoff)
- **Rate limiter** (Redis sliding window)
- **Idempotency** (IdempotencyRecord)
- **CQRS-ready** (có thể mở rộng)

## 6. Tối ưu performance
- Redis cache permission, invalidate khi đổi quyền
- BullMQ xử lý notification/email bất đồng bộ
- Outbox pattern đảm bảo event delivery
- Rate limiting chống abuse

## 7. Hướng mở rộng & scale
- Horizontal scaling: mỗi service có thể scale độc lập
- CQRS, event sourcing, OpenTelemetry, circuit breaker
- mTLS, API versioning, multi-tenant
- Có thể tách DB, scale queue, scale WebSocket

## 8. Hướng dẫn setup & run
```bash
# Clone repo
$ git clone ...
$ cd Backend-Mini-Q-A-Platform

# Copy .env.example → .env và chỉnh sửa thông tin
$ cp .env.prod.example .env.prod

# Build & run bằng Docker Compose
$ cd infra
$ docker compose -f docker-compose.prod.yml build
$ docker compose -f docker-compose.prod.yml up -d

# Chạy migrate & seed cho từng service
$ docker compose -f docker-compose.prod.yml exec auth-service npx prisma migrate deploy --schema=./prisma/schema.prisma
$ docker compose -f docker-compose.prod.yml exec auth-service npx prisma db seed --schema=./prisma/schema.prisma
# ... tương tự cho content-service, notification-service

# Truy cập API docs (Swagger)
http://localhost:8000/api
```

## 9. API Documentation
- Swagger UI: http://localhost:8000/api
- Đã có example data khớp seed, có thể login bằng `admin@example.com` / `Admin@123` để test trực tiếp

## 10. Giải thích quyết định kỹ thuật
- **NestJS**: Modular, DI, dễ mở rộng
- **Prisma**: ORM mạnh, migration, type-safe
- **BullMQ**: Queue mạnh, retry, job event
- **NATS**: Event bus, đảm bảo event delivery
- **RBAC**: Không hard-code, permission versioning, invalidate cache
- **Notification**: Bắt buộc async, không block request
- **Moderation**: Đúng nghiệp vụ, workflow rõ ràng

## 11. Đề xuất cải thiện & scale
- Thêm OpenTelemetry, circuit breaker, mTLS
- Tách DB, scale queue, scale WebSocket
- CQRS, event sourcing, multi-tenant
- Frontend demo (Next.js)

