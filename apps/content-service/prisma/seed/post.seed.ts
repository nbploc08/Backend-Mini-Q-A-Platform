import type { PrismaClient } from '.prisma/content-client';
import type { SeedUserReplica } from './user-replica.seed';

export type SeedPost = { id: number; authorId: string };

export async function runPostSeed(
  prisma: PrismaClient,
  users: SeedUserReplica[],
): Promise<SeedPost[]> {
  const postsData = Array.from({ length: 30 }).map((_, i) => {
    const author = users[i % users.length]!;
    return {
      title: `Post #${i + 1}`,
      content: `Nội dung demo cho post #${i + 1}. Đây là bài viết mẫu phục vụ seed data.`,
      status: i % 5 === 0 ? 'PENDING' : i % 7 === 0 ? 'REJECTED' : 'APPROVED',
      authorId: author.id,
      avatarUrl: author.avatarUrl,
    } as const;
  });

  const created: SeedPost[] = [];
  for (const data of postsData) {
    const p = await prisma.post.create({ data });
    created.push({ id: p.id, authorId: p.authorId });
  }

  console.log('Post seed OK:', created.length);
  return created;
}
