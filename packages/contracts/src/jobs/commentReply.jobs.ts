import { z } from 'zod';

export const COMMENT_REPLY = 'comment.reply' as const;

export const CommentReplySchema = z.object({
  commentId: z.number().int(),
  contentSnippet: z.string(),
  commenterName: z.string().nullable().optional(),
  targetUserId: z.string(),
  replyToCommentId: z.number().int(),
});
export type CommentReplyJob = z.infer<typeof CommentReplySchema>;
