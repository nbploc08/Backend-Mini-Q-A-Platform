-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST_APPROVED', 'POST_REJECTED', 'COMMENT_REPLIED');

-- AlterTable: cast type column from TEXT to enum using USING clause
ALTER TABLE "notifications"
  ALTER COLUMN "type" TYPE "NotificationType" USING "type"::"NotificationType";

-- AlterTable: add referenceId column
ALTER TABLE "notifications" ADD COLUMN "referenceId" INTEGER;

-- AlterTable: drop data column
ALTER TABLE "notifications" DROP COLUMN "data";
