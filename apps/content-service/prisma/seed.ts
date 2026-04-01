import { PrismaClient } from '.prisma/content-client';
import { runUserReplicaSeed } from './seed/user-replica.seed';
import { runPostSeed } from './seed/post.seed';
import { runQuestionSeed } from './seed/question.seed';
import { runCommentSeed } from './seed/comment.seed';

const prisma = new PrismaClient();

async function main() {
  // Clean in FK-safe order (re-runnable seed)
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.userReplica.deleteMany({});

  const users = await runUserReplicaSeed(prisma);
  const posts = await runPostSeed(prisma, users);
  const questions = await runQuestionSeed(prisma, users);
  await runCommentSeed(prisma, { users, posts, questions });
  console.log('All seeds done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

