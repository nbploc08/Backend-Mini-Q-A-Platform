-- Align user_replicas with auth-service user id (UUID text) and add email column.
-- Clears content tables because integer ids cannot map to UUIDs.

ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_replyToId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_parentId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_questionId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_postId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_authorId_fkey";
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_authorId_fkey";
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_authorId_fkey";

TRUNCATE TABLE "comments", "posts", "questions", "user_replicas" RESTART IDENTITY CASCADE;

ALTER TABLE "user_replicas" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "user_replicas" ALTER COLUMN "email" SET NOT NULL;

ALTER TABLE "user_replicas" DROP CONSTRAINT "user_replicas_pkey";
ALTER TABLE "user_replicas" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "user_replicas" ALTER COLUMN "id" TYPE TEXT USING ("id"::text);
ALTER TABLE "user_replicas" ADD CONSTRAINT "user_replicas_pkey" PRIMARY KEY ("id");

ALTER TABLE "posts" ALTER COLUMN "authorId" TYPE TEXT USING ("authorId"::text);
ALTER TABLE "questions" ALTER COLUMN "authorId" TYPE TEXT USING ("authorId"::text);
ALTER TABLE "comments" ALTER COLUMN "authorId" TYPE TEXT USING ("authorId"::text);

ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_replicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_replicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user_replicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
