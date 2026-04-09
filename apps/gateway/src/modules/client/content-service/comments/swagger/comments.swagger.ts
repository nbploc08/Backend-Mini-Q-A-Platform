import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// ========================
// POST /client/comments — Create comment
// ========================
export const CREATE_COMMENT_OPERATION = ApiOperation({
  summary: 'Tạo comment mới',
  description:
    'Tạo comment cho bài viết (postId) hoặc câu hỏi (questionId). Hỗ trợ reply (parentId) và reply trực tiếp (replyToId).',
});

export const CREATE_COMMENT_RESPONSE = ApiResponse({
  status: 201,
  description: 'Tạo comment thành công',
  schema: {
    example: {
      id: 101,
      content: 'Bình luận cho post 1 (#101)',
      postId: 1,
      questionId: null,
      parentId: null,
      replyToId: null,
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const CREATE_COMMENT_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: { statusCode: 400, message: ['content should not be empty'], error: 'Bad Request' },
    },
  }),
  NOT_FOUND: ApiResponse({
    status: 404,
    description: 'Post hoặc question không tồn tại',
    schema: {
      example: { statusCode: 404, message: 'Post not found', error: 'Not Found' },
    },
  }),
};

// ========================
// GET /client/comments/post/:postId
// ========================
export const FIND_BY_POST_OPERATION = ApiOperation({
  summary: 'Lấy comments theo bài viết',
  description: 'Lấy danh sách comments của một bài viết với phân trang.',
});

export const POST_ID_PARAM = ApiParam({
  name: 'postId',
  description: 'ID của bài viết',
  example: 1,
  type: 'number',
});

export const COMMENTS_QUERY_PAGE = ApiQuery({
  name: 'page',
  required: false,
  type: String,
  example: '1',
  description: 'Số trang (mặc định 1)',
});

export const COMMENTS_QUERY_PER_PAGE = ApiQuery({
  name: 'per_page',
  required: false,
  type: String,
  example: '10',
  description: 'Số lượng comments mỗi trang (mặc định 10)',
});

export const FIND_BY_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy comments thành công',
  schema: {
    example: {
      data: [
        {
          id: 1,
          content: 'Bình luận cho post 1 (#1)',
          postId: 1,
          parentId: null,
          replyToId: null,
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          children: [],
        },
      ],
      total: 45,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/comments/question/:questionId
// ========================
export const FIND_BY_QUESTION_OPERATION = ApiOperation({
  summary: 'Lấy comments theo câu hỏi',
  description: 'Lấy danh sách comments của một câu hỏi với phân trang.',
});

export const QUESTION_ID_PARAM = ApiParam({
  name: 'questionId',
  description: 'ID của câu hỏi',
  example: 1,
  type: 'number',
});

export const FIND_BY_QUESTION_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy comments thành công',
  schema: {
    example: {
      data: [
        {
          id: 46,
          content: 'Bình luận cho question 1 (#1)',
          questionId: 1,
          parentId: null,
          replyToId: null,
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          children: [],
        },
      ],
      total: 30,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/comments/:id
// ========================
export const GET_COMMENT_OPERATION = ApiOperation({
  summary: 'Lấy chi tiết comment theo ID',
  description: 'Trả về thông tin chi tiết của một comment.',
});

export const COMMENT_ID_PARAM = ApiParam({
  name: 'id',
  description: 'ID của comment',
  example: 1,
  type: 'number',
});

export const GET_COMMENT_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy comment thành công',
  schema: {
    example: {
      id: 1,
      content: 'Bình luận cho post 1 (#1)',
      postId: 1,
      questionId: null,
      parentId: null,
      replyToId: null,
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

// ========================
// PATCH /client/comments/:id — Update comment
// ========================
export const UPDATE_COMMENT_OPERATION = ApiOperation({
  summary: 'Cập nhật nội dung comment',
  description: 'Cập nhật nội dung của comment đã tạo. Chỉ chủ sở hữu mới được phép.',
});

export const UPDATE_COMMENT_RESPONSE = ApiResponse({
  status: 200,
  description: 'Cập nhật comment thành công',
  schema: {
    example: {
      id: 1,
      content: 'Nội dung đã được cập nhật',
      postId: 1,
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// DELETE /client/comments/:id
// ========================
export const DELETE_COMMENT_OPERATION = ApiOperation({
  summary: 'Xóa comment',
  description: 'Xóa comment. Chỉ chủ sở hữu hoặc admin mới được phép.',
});

export const DELETE_COMMENT_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xóa comment thành công',
  schema: {
    example: { message: 'Comment deleted successfully' },
  },
});
