import type { PrismaClient } from '.prisma/content-client';

/** Deterministic UUID-like ids for seed data (match auth user id shape). */
function seedUserId(i: number): string {
  return `00000000-0000-4000-8000-${(1000 + i).toString(16).padStart(12, '0')}`;
}

export type SeedUserReplica = {
  id: string;
};

export async function runUserReplicaSeed(prisma: PrismaClient): Promise<SeedUserReplica[]> {
  const users: SeedUserReplica[] = Array.from({ length: 12 }).map((_, i) => ({
    id: seedUserId(i),
  }));

  await prisma.userReplica.deleteMany({});

  await prisma.userReplica.createMany({
    data: users.map((u, idx) => ({
      id: u.id,
      email: `seed-user-${idx + 1}@example.com`,
      name: idx === 0 ? 'Admin Seed Replica' : `User Replica ${idx + 1}`,
      avatarUrl: idx % 3 === 0 ? `https://example.com/avatar/${u.id}.png` : null,
    })),
  });

  console.log('UserReplica seed OK:', users.length);
  return users;
}
