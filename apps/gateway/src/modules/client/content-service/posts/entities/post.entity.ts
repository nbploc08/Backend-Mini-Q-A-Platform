// Post entity is managed by content-service Prisma schema
export interface PostEntity {
  id: number;
  title: string;
  content: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
}
