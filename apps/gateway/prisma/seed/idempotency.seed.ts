import type { PrismaClient } from '.prisma/gateway-client';
import { Prisma } from '.prisma/gateway-client';

export async function runIdempotencySeed(prisma: PrismaClient) {
  await prisma.idempotencyRecord.deleteMany({});

  const now = new Date();
  const hour = 60 * 60 * 1000;

  const records: Prisma.IdempotencyRecordCreateManyInput[] = [
    {
      key: 'seed-create-post-1',
      requestHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      status: 'completed',
      responseStatus: 201,
      responseBody: { id: 1, title: 'Post #1' },
      expiresAt: new Date(now.getTime() + 24 * hour),
    },
    {
      key: 'seed-create-post-2',
      requestHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
      status: 'completed',
      responseStatus: 201,
      responseBody: { id: 2, title: 'Post #2' },
      expiresAt: new Date(now.getTime() + 24 * hour),
    },
    {
      key: 'seed-create-question-1',
      requestHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
      status: 'processing',
      responseStatus: undefined,
      responseBody: Prisma.JsonNull,
      expiresAt: new Date(now.getTime() + 1 * hour),
    },
    {
      key: 'seed-failed-operation',
      requestHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      status: 'failed',
      responseStatus: 500,
      responseBody: { error: 'Internal Server Error' },
      expiresAt: new Date(now.getTime() + 2 * hour),
    },
    {
      key: 'seed-expired-record',
      requestHash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      status: 'completed',
      responseStatus: 200,
      responseBody: { message: 'OK' },
      expiresAt: new Date(now.getTime() - 1 * hour), // already expired
    },
  ];

  await prisma.idempotencyRecord.createMany({ data: records });

  console.log('Idempotency seed OK:', records.length);
}
