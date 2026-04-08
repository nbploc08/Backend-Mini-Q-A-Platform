import type { PrismaClient } from '.prisma/content-client';

/** Deterministic UUID — must match auth-service user seed. */
function seedUserId(i: number): string {
  return `00000000-0000-4000-8000-${(1000 + i).toString(16).padStart(12, '0')}`;
}

export type SeedUserReplica = {
  id: string;
  avatarUrl: string | null;
};

/** Must mirror the users created in auth-service seed (same IDs & emails). */
const REPLICA_DATA: { name: string; email: string; avatarUrl: string | null }[] = [
  { name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
  { name: 'Moderator Seed', email: 'moderator@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/moderator.jpg' },
  { name: 'User Seed 1', email: 'user1@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user1.jpg' },
  { name: 'User Seed 2', email: 'user2@example.com', avatarUrl: null },
  { name: 'User Seed 3', email: 'user3@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user3.jpg' },
  { name: 'User Seed 4', email: 'user4@example.com', avatarUrl: null },
  { name: 'User Seed 5', email: 'user5@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user5.jpg' },
  { name: 'User Seed 6', email: 'user6@example.com', avatarUrl: null },
  { name: 'User Seed 7', email: 'user7@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user7.jpg' },
  { name: 'User Seed 8', email: 'user8@example.com', avatarUrl: null },
  { name: 'User Seed 9', email: 'user9@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user9.jpg' },
  { name: 'User Seed 10', email: 'user10@example.com', avatarUrl: null },
];

export async function runUserReplicaSeed(prisma: PrismaClient): Promise<SeedUserReplica[]> {
  const users: SeedUserReplica[] = REPLICA_DATA.map((_, i) => ({
    id: seedUserId(i),
    avatarUrl: REPLICA_DATA[i]!.avatarUrl,
  }));

  await prisma.userReplica.createMany({
    data: users.map((u, idx) => ({
      id: u.id,
      email: REPLICA_DATA[idx]!.email,
      name: REPLICA_DATA[idx]!.name,
      avatarUrl: REPLICA_DATA[idx]!.avatarUrl,
    })),
  });

  console.log('UserReplica seed OK:', users.length);
  return users;
}
