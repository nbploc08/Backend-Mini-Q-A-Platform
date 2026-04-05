import { PrismaClient } from '.prisma/notification-client';
import { runNotificationSeed } from './seed/notification.seed';

const prisma = new PrismaClient();

async function main() {
  await runNotificationSeed(prisma);
  console.log('All seeds done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
