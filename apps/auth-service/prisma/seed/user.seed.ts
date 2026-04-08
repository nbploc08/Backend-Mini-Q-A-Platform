import type { PrismaClient } from '.prisma/auth-client';
import * as argon2 from 'argon2';

/** Deterministic UUIDs — shared with content-service user-replica seed. */
function seedUserId(i: number): string {
  return `00000000-0000-4000-8000-${(1000 + i).toString(16).padStart(12, '0')}`;
}

const ARGON_OPTS = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3 } as const;

interface SeedUserInput {
  index: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  age?: number;
  address?: string;
  role: 'admin' | 'moderator' | 'user';
}

const SEED_USERS: SeedUserInput[] = [
  {
    index: 0,
    email: 'admin@example.com',
    password: 'Admin@123',
    name: 'Admin Seed',
    phone: '0901000001',
    age: 30,
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    role: 'admin',
  },
  {
    index: 1,
    email: 'moderator@example.com',
    password: 'Mod@1234',
    name: 'Moderator Seed',
    phone: '0901000002',
    age: 28,
    address: '456 Lê Lợi, Q.1, TP.HCM',
    role: 'moderator',
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    index: i + 2,
    email: `user${i + 1}@example.com`,
    password: 'User@1234',
    name: `User Seed ${i + 1}`,
    phone: i % 2 === 0 ? `090100${(i + 3).toString().padStart(4, '0')}` : undefined,
    age: i % 3 === 0 ? 20 + i * 2 : undefined,
    address: i % 4 === 0 ? `${100 + i} Trần Hưng Đạo, Q.5, TP.HCM` : undefined,
    role: 'user' as const,
  })),
];

export async function runUserSeed(prisma: PrismaClient) {
  const createdUsers: { id: string; email: string; role: string }[] = [];

  for (const u of SEED_USERS) {
    const id = seedUserId(u.index);
    const passwordHash = await argon2.hash(u.password, ARGON_OPTS);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone ?? null, age: u.age ?? null, address: u.address ?? null },
      create: {
        id,
        email: u.email,
        passwordHash,
        name: u.name,
        phone: u.phone ?? null,
        age: u.age ?? null,
        address: u.address ?? null,
        isActive: true,
      },
    });

    const role = await prisma.role.findUnique({ where: { name: u.role } });
    if (!role) throw new Error(`Role "${u.role}" not found. Run role seed first.`);

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    createdUsers.push({ id: user.id, email: user.email, role: u.role });
  }

  console.log(`User seed OK: ${createdUsers.length} users created.`);
  console.log('  Admin : admin@example.com / Admin@123');
  console.log('  Mod   : moderator@example.com / Mod@1234');
  console.log('  Users : user1@example.com .. user10@example.com / User@1234');
  return createdUsers;
}
