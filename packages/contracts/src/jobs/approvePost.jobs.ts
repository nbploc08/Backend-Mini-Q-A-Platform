import { z } from 'zod';

export const POST_APPROVE = 'post.approve' as const;

export const PostApproveSchema = z.object({
  postId: z.number().int(),
  title: z.string(),
  authorId: z.string(),
});
export type PostApproveJob = z.infer<typeof PostApproveSchema>;
