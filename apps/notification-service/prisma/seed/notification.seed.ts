import type { PrismaClient } from '.prisma/notification-client';
import { randomUUID } from 'node:crypto';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export async function runNotificationSeed(prisma: PrismaClient) {
  const userIds = Array.from({ length: 5 }).map(() => randomUUID());

  const types = ['POST_APPROVED', 'POST_REJECTED', 'COMMENT_REPLIED'] as const;

  const now = Date.now();
  const notifications = Array.from({ length: 60 }).map((_, i) => {
    const type = pick(types);
    const userId = pick(userIds);

    const title =
      type === 'POST_APPROVED'
        ? 'Bài viết của bạn đã được duyệt'
        : type === 'POST_REJECTED'
          ? 'Bài viết của bạn bị từ chối'
          : 'Có người trả lời bình luận của bạn';

    const body =
      type === 'COMMENT_REPLIED'
        ? 'Mở bài viết để xem phản hồi mới nhất.'
        : 'Xem chi tiết trong ứng dụng.';

    return {
      userId,
      type,
      title,
      body,
      data: {
        actionCreatedAt: new Date(now - i * 120_000).toISOString(),
        referenceId: 1000 + i,
      },
      readAt: i % 4 === 0 ? new Date(now - i * 60_000) : null,
      createdAt: new Date(now - i * 120_000),
    };
  });

  // Seed should be re-runnable without needing truncate migrations/tables.
  // We keep data volume stable by clearing only this table.
  await prisma.notification.deleteMany({});
  await prisma.notification.createMany({ data: notifications });

  console.log('Notification seed OK:', {
    users: userIds.length,
    notifications: notifications.length,
    sampleUserIds: userIds.slice(0, 2),
  });
}

