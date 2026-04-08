import type { PrismaClient } from '.prisma/content-client';
import type { SeedUserReplica } from './user-replica.seed';
import type { SeedPost } from './post.seed';
import type { SeedQuestion } from './question.seed';

export async function runCommentSeed(
  prisma: PrismaClient,
  params: { users: SeedUserReplica[]; posts: SeedPost[]; questions: SeedQuestion[] },
) {
  const { users, posts, questions } = params;

  const baseComments: { id: number; postId?: number; questionId?: number }[] = [];

  // Seed post comments
  for (let i = 0; i < 45; i++) {
    const author = users[i % users.length]!;
    const postId = posts[i % posts.length]!.id;
    const c = await prisma.comment.create({
      data: {
        content: `Bình luận cho post ${postId} (#${i + 1})`,
        authorId: author.id,
        avatarUrl: author.avatarUrl,
        postId,
      },
    });
    baseComments.push({ id: c.id, postId });
  }

  // Seed question comments
  for (let i = 0; i < 30; i++) {
    const author = users[(i * 3) % users.length]!;
    const questionId = questions[i % questions.length]!.id;
    const c = await prisma.comment.create({
      data: {
        content: `Bình luận cho question ${questionId} (#${i + 1})`,
        authorId: author.id,
        avatarUrl: author.avatarUrl,
        questionId,
      },
    });
    baseComments.push({ id: c.id, questionId });
  }

  // Replies (threaded comments)
  for (let i = 0; i < 25; i++) {
    const parent = baseComments[i % baseComments.length]!;
    const author = users[(i * 5) % users.length]!;
    await prisma.comment.create({
      data: {
        content: `Reply to comment ${parent.id} (#${i + 1})`,
        authorId: author.id,
        avatarUrl: author.avatarUrl,
        postId: parent.postId ?? null,
        questionId: parent.questionId ?? null,
        parentId: parent.id,
        replyToId: parent.id,
      },
    });
  }

  const total = await prisma.comment.count();
  console.log('Comment seed OK:', total);
}
