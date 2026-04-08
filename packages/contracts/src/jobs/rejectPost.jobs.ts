import { z } from 'zod';

export const POST_REJECT = 'post.reject' as const;

export const PostRejectSchema = z.object({
  postId: z.number().int(),
  title: z.string(),
  authorId: z.string(),
});
export type PostRejectJob = z.infer<typeof PostRejectSchema>;
