// Post entity is managed by content-service Prisma schema
export interface PostEntity {
  id: number;
  title: string;
  content: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  authorId: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}
