export interface CommentEntity {
  id: number;
  content: string;
  postId?: number | null;
  questionId?: number | null;
  parentId?: number | null;
  replyToId?: number | null;
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
