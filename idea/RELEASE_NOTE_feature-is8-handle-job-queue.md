# Release Note

- **Release date**: 08/04/2026
- **Scope**: Content Service (CRUD Posts/Comments/Questions + Cloudinary + Job Queue Producer) + Notification Service (Job Queue Consumer) + Gateway (proxy endpoints) + Shared Contracts
- **Device**: Backend API (NestJS) — content-service, notification-service, gateway, packages/contracts
- **Branch**: `feature/is-8/handle-job-queue`

## Overview

- **Job Queue cho notification bất đồng bộ**: tích hợp BullMQ + Redis để gửi thông báo khi duyệt/từ chối bài viết, comment mới, reply comment. `content-service` đóng vai trò **Producer**, `notification-service` đóng vai trò **Consumer**.
- **Content Service — Posts**: CRUD đầy đủ với **moderation workflow** (`DRAFT → PENDING → APPROVED/REJECTED`), chỉ moderator mới được approve/reject (guard `POSTS_MODERATE`).
- **Content Service — Comments**: hỗ trợ comment đa cấp (parent/replies + replyTo), có thể comment vào cả Post lẫn Question; validate ownership khi sửa/xóa.
- **Content Service — Questions**: CRUD câu hỏi Q&A cơ bản với pagination, không có moderation workflow.
- **Cloudinary Integration**: upload ảnh (từ URL hoặc multipart file), lấy danh sách ảnh; validate file size (max 5MB) và định dạng (jpeg/png/gif/webp/svg) tại cả gateway lẫn content-service.
- **User Replica**: đồng bộ user từ auth-service sang content-service qua job `CREATE_USER_REP`, dùng cho việc join thông tin tác giả mà không cần gọi cross-service.
- **Gateway**: thêm proxy endpoints cho Posts, Comments, Questions, Cloudinary với rate limiting và public/private access control.
- **Shared Contracts** (Zod): thêm 4 job contract mới (`post.approve`, `post.reject`, `comment.onPost`, `comment.reply`).

---

## Changes

### Content Service — Posts Module

**Moderation Workflow**

- Luồng trạng thái bài viết:
  ```
  DRAFT → (submit) → PENDING → (approve) → APPROVED
                             → (reject)  → REJECTED
  APPROVED/REJECTED → (update) → PENDING (tự động reset khi chỉnh sửa)
  ```
- `create()`: luôn tạo với status `DRAFT`.
- `submit()`: chỉ cho phép submit nếu đang là `DRAFT`.
- `approve()`: chỉ được approve khi `PENDING`; sau khi approve → đẩy job `post.approve` vào queue notification-service.
- `reject()`: tương tự approve, đẩy job `post.reject` kèm `reason`.
- `findAll()`: mặc định chỉ trả về post `APPROVED` (public listing), trừ khi truyền filter `status`.

**Controller**

- `PATCH /posts/internal/:id/approve` và `PATCH /posts/internal/:id/reject` — bảo vệ bởi `@RequirePermission(PermissionCode.POSTS_MODERATE)`.
- `PATCH /posts/internal/:id/submit` — mở cho mọi user đã đăng nhập.

---

### Content Service — Comments Module

**Nghiệp vụ Comment**

- `create()`: validate comment phải thuộc về đúng **một** trong hai: `postId` hoặc `questionId` (không được thiếu cả hai, không được có cả hai). Verify sự tồn tại của post/question/parentComment/replyTo trước khi tạo.
- Sau khi tạo comment:
  - Nếu là **reply** (`replyToId` có giá trị): đẩy job `comment.reply` → notify tác giả comment được reply (trừ tự reply chính mình).
  - Nếu **comment trực tiếp vào post/question**: đẩy job `comment.onPost` → notify tác giả bài viết/câu hỏi (trừ tự comment).
- `findByPost()` / `findByQuestion()`: lấy comments gốc (không có parent) theo pagination, kèm replies lồng nhau và thông tin `replyTo`.
- `update()` / `remove()`: kiểm tra quyền sở hữu — chỉ author mới được sửa/xóa.

**Schema — Comment đa cấp**

- Hai quan hệ tự tham chiếu:
  - `parent/replies` (`"CommentToComment"`) — phân cấp cha-con.
  - `replyTo/repliedBy` (`"ReplyToTarget"`) — track cụ thể comment nào đang được reply.
- Nullable foreign keys: `postId` hoặc `questionId` (comment có thể thuộc Post hoặc Question).

---

### Content Service — Questions Module

- CRUD câu hỏi cơ bản: `create`, `findAll`, `findMyQuestions`, `findOne`, `update`, `remove`.
- Pagination mặc định, sắp xếp mới nhất trước.
- Kiểm tra quyền sở hữu khi update/remove.
- Không tích hợp moderation workflow (khác với Posts).

---

### Content Service — Cloudinary Module

- `uploadFileToEcommerceFolder(file)` — upload ảnh từ buffer (multipart), dùng `upload_stream` để tránh ghi file tạm.
- `uploadToEcommerceFolder(url)` — upload ảnh từ URL, resize về width 150px.
- `getImagesList()` — lấy tối đa 50 ảnh trong folder `samples/ecommerce`.
- Validate: max 5MB, chỉ chấp nhận `jpeg/png/gif/webp/svg`.

---

### Content Service — Queue Module (Producer)

- Đọc `REDIS_URL` từ env, throw error nếu thiếu.
- Đăng ký queue `notification-service` với retry 3 lần, backoff exponential.
- `QueueService` expose 4 method:
  - `approvePost(data)` → job `post.approve`
  - `rejectPost(data)` → job `post.reject`
  - `commentOnPost(data)` → job `comment.onPost`
  - `commentReply(data)` → job `comment.reply`
- Cấu hình: retry 3 lần, backoff exponential 2s, `removeOnFail: false` để dễ debug.

---

### Content Service — Jobs Module (Consumer)

- Lắng nghe queue `content-service`, xử lý job `CREATE_USER_REP` để upsert `UserReplica` vào DB.
- Xử lý lỗi Redis: nếu `ECONNREFUSED`, chỉ log warning, không crash app.
- Job thất bại hết retry → đẩy vào Dead Letter Queue `content-service-dlq`.

---

### Content Service — Prisma Schema

- 4 model chính: `UserReplica`, `Post` (enum `PostStatus`), `Question`, `Comment`.
- Index trên `Post.status`, `Post.authorId`, `Question.authorId`.
- Migration: `20260401123759` (schema mới) + `20260405143000_user_replica_uuid`.

---

### Notification Service — Jobs Consumer

- Thêm 4 job handler mới:

| Job name | Notification Type | Hành động |
|---|---|---|
| `post.approve` | `POST_APPROVED` | Tạo notification cho tác giả bài viết |
| `post.reject` | `POST_REJECTED` | Tạo notification cho tác giả bài viết |
| `comment.onPost` | `NEW_COMMENT` | Tạo notification cho tác giả bài viết/câu hỏi |
| `comment.reply` | `COMMENT_REPLIED` | Tạo notification cho tác giả comment bị reply |

- Concurrency: 10 workers.
- Dead Letter Queue: `notification-service-dlq`.
- Schema migration: thêm enum values `POST_APPROVED`, `POST_REJECTED`, `NEW_COMMENT`, `COMMENT_REPLIED` vào `NotificationType`.

---

### Gateway — Proxy Endpoints

**Posts** (`/client/posts`)

- `GET /client/posts` và `GET /client/posts/:id` — `@Public()`, không cần auth.
- Rate limit: 60 req/phút mặc định, riêng create 10 req/phút.
- Endpoints: `create`, `findAll`, `findMyPosts`, `findOne`, `update`, `submit`, `approve`, `reject`, `remove`.

**Comments** (`/client/comments`)

- `GET /client/comments/post/:postId`, `/question/:questionId`, `/:id` — `@Public()`.
- Rate limit create: 20 req/phút.
- Endpoints: `create`, `findByPost`, `findByQuestion`, `findOne`, `update`, `remove`.

**Questions** (`/client/questions`)

- CRUD proxy tương tự.

**Cloudinary** (`/client/cloudinary`)

- `GET /client/cloudinary/images` — `@Public()`.
- `POST /client/cloudinary/image/upload` — yêu cầu auth, validate file tại gateway trước khi proxy.

---

### Shared Contracts (`packages/contracts`)

- Thêm 4 job contract mới với Zod schema validation:
  - `approvePost.jobs.ts` — `{ postId: number, title: string, authorId: string }`
  - `rejectPost.jobs.ts` — `{ postId: number, title: string, authorId: string }`
  - `commentOnPost.jobs.ts` — `{ commentId: number, contentSnippet: string, commenterName?: string | null, targetUserId: string, postId?: number | null, questionId?: number | null }`
  - `commentReply.jobs.ts` — `{ commentId: number, contentSnippet: string, commenterName?: string | null, targetUserId: string, replyToCommentId: number }`

---

## Architecture Flow

```
Client
  → Gateway (rate limit, JWT auth, public/private check)
    → content-service (business logic, Prisma DB)
      → QueueService (BullMQ Producer)
        → Redis Queue "notification-service"
          → notification-service JobsService (BullMQ Consumer, concurrency=10)
            → NotificationService.createNoti() (lưu DB notification)
```

---

## Database Migrations

| Service | Migration | Mô tả |
|---|---|---|
| content-service | `20260401123759` | Schema ban đầu: UserReplica, Post, Question, Comment |
| content-service | `20260405143000_user_replica_uuid` | Đổi UserReplica ID sang UUID |
| notification-service | `20260408_add_new_comment_type` | Thêm enum values cho NotificationType |

---

## Files Changed

- **128 files changed**, **4,515 insertions(+)**, **98 deletions(-)**
- Các service chính bị ảnh hưởng: `content-service` (mới), `notification-service`, `gateway`, `auth-service`, `packages/contracts`, `packages/common`
