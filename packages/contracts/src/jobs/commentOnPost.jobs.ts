import { z } from 'zod';

export const COMMENT_ON_POST = 'comment.onPost' as const;

export const CommentOnPostSchema = z.object({
  commentId: z.number().int(),
  contentSnippet: z.string(),
  commenterName: z.string().nullable().optional(),
  targetUserId: z.string(),
  postId: z.number().int().nullable().optional(),
  questionId: z.number().int().nullable().optional(),
});
export type CommentOnPostJob = z.infer<typeof CommentOnPostSchema>;
