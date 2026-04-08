import type { PrismaClient } from '.prisma/notification-client';

/** Use the same deterministic user IDs as auth/content seeds. */
function seedUserId(i: number): string {
  return `00000000-0000-4000-8000-${(1000 + i).toString(16).padStart(12, '0')}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export async function runNotificationSeed(prisma: PrismaClient) {
  // 12 user IDs matching auth-service seed
  const userIds = Array.from({ length: 12 }, (_, i) => seedUserId(i));

  const types = ['POST_APPROVED', 'POST_REJECTED', 'COMMENT_REPLIED', 'NEW_COMMENT'] as const;

  const now = Date.now();
  const notifications = Array.from({ length: 60 }).map((_, i) => {
    const type = pick(types);
    const userId = pick(userIds);

    const title =
      type === 'POST_APPROVED'
        ? 'Bài viết của bạn đã được duyệt'
        : type === 'POST_REJECTED'
          ? 'Bài viết của bạn bị từ chối'
          : type === 'COMMENT_REPLIED'
            ? 'Có người trả lời bình luận của bạn'
            : 'Có bình luận mới trên bài viết của bạn';

    const body =
      type === 'COMMENT_REPLIED' || type === 'NEW_COMMENT'
        ? 'Mở bài viết để xem phản hồi mới nhất.'
        : 'Xem chi tiết trong ứng dụng.';

    return {
      userId,
      type,
      title,
      body,
      referenceId: 1000 + i,
      readAt: i % 4 === 0 ? new Date(now - i * 60_000) : null,
      createdAt: new Date(now - i * 120_000),
    };
  });

  await prisma.notification.deleteMany({});
  await prisma.notification.createMany({ data: notifications });

  const uniqueUsers = new Set(notifications.map((n) => n.userId));
  console.log('Notification seed OK:', {
    users: uniqueUsers.size,
    notifications: notifications.length,
    sampleUserIds: userIds.slice(0, 2),
  });
}
