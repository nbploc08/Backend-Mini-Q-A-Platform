export interface QuestionEntity {
  id: number;
  title: string;
  content: string;
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
