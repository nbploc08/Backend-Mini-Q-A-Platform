import { PrismaClient } from '.prisma/gateway-client';
import { runIdempotencySeed } from './seed/idempotency.seed';

const prisma = new PrismaClient();

async function main() {
  await runIdempotencySeed(prisma);
  console.log('All seeds done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
