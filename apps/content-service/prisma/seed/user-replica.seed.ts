import type { PrismaClient } from '.prisma/content-client';

export type SeedUserReplica = {
  id: number;
};

export async function runUserReplicaSeed(prisma: PrismaClient): Promise<SeedUserReplica[]> {
  const users: SeedUserReplica[] = Array.from({ length: 12 }).map((_, i) => ({
    id: 1000 + i,
  }));

  // Make seed re-runnable with stable ids.
  await prisma.userReplica.deleteMany({});

  await prisma.userReplica.createMany({
    data: users.map((u, idx) => ({
      id: u.id,
      name: idx === 0 ? 'Admin Seed Replica' : `User Replica ${idx + 1}`,
      avatarUrl: idx % 3 === 0 ? `https://example.com/avatar/${u.id}.png` : null,
    })),
  });

  console.log('UserReplica seed OK:', users.length);
  return users;
}
