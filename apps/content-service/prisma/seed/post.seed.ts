import type { PrismaClient } from '.prisma/content-client';
import type { SeedUserReplica } from './user-replica.seed';

export type SeedPost = { id: number; authorId: number };

export async function runPostSeed(
  prisma: PrismaClient,
  users: SeedUserReplica[],
): Promise<SeedPost[]> {
  await prisma.post.deleteMany({});

  const postsData = Array.from({ length: 30 }).map((_, i) => {
    const authorId = users[i % users.length]!.id;
    return {
      title: `Post #${i + 1}`,
      content: `Nội dung demo cho post #${i + 1}.`,
      status: i % 5 === 0 ? 'PENDING' : i % 7 === 0 ? 'REJECTED' : 'APPROVED',
      authorId,
    } as const;
  });

  // createMany doesn't return ids; use create() to get ids.
  const created: SeedPost[] = [];
  for (const data of postsData) {
    const p = await prisma.post.create({ data });
    created.push({ id: p.id, authorId: p.authorId });
  }

  console.log('Post seed OK:', created.length);
  return created;
}
