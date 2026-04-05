import { z } from 'zod';

export const CREATE_USER_REP = 'user.created' as const;

export const CreateUserRepSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type CreateUserRepJob = z.infer<typeof CreateUserRepSchema>;
