import type { PrismaClient } from '.prisma/content-client';
import type { SeedUserReplica } from './user-replica.seed';

export type SeedQuestion = { id: number; authorId: string };

export async function runQuestionSeed(
  prisma: PrismaClient,
  users: SeedUserReplica[],
): Promise<SeedQuestion[]> {
  await prisma.question.deleteMany({});

  const questionsData = Array.from({ length: 20 }).map((_, i) => {
    const authorId = users[(i * 2) % users.length]!.id;
    return {
      title: `Question #${i + 1}`,
      content: `Câu hỏi demo #${i + 1}: làm sao để ...?`,
      authorId,
    } as const;
  });

  const created: SeedQuestion[] = [];
  for (const data of questionsData) {
    const q = await prisma.question.create({ data });
    created.push({ id: q.id, authorId: q.authorId });
  }

  console.log('Question seed OK:', created.length);
  return created;
}
