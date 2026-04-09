import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// ========================
// POST /client/questions — Create question
// ========================
export const CREATE_QUESTION_OPERATION = ApiOperation({
  summary: 'Tạo câu hỏi mới',
  description: 'Tạo câu hỏi mới trong hệ thống Q&A. Cần đăng nhập.',
});

export const CREATE_QUESTION_RESPONSE = ApiResponse({
  status: 201,
  description: 'Tạo câu hỏi thành công',
  schema: {
    example: {
      id: 21,
      title: 'Question #21',
      content: 'Câu hỏi demo #21: làm sao để ...?',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const CREATE_QUESTION_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: { statusCode: 400, message: ['title should not be empty'], error: 'Bad Request' },
    },
  }),
};

// ========================
// GET /client/questions — Get all questions
// ========================
export const GET_ALL_QUESTIONS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách câu hỏi',
  description: 'Lấy danh sách tất cả câu hỏi với phân trang. Public API.',
});

export const QUESTIONS_QUERY_PAGE = ApiQuery({
  name: 'page',
  required: false,
  type: String,
  example: '1',
  description: 'Số trang (mặc định 1)',
});

export const QUESTIONS_QUERY_PER_PAGE = ApiQuery({
  name: 'per_page',
  required: false,
  type: String,
  example: '10',
  description: 'Số câu hỏi mỗi trang (mặc định 10)',
});

export const GET_ALL_QUESTIONS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách câu hỏi thành công',
  schema: {
    example: {
      data: [
        {
          id: 1,
          title: 'Question #1',
          content: 'Câu hỏi demo #1: làm sao để ...?',
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          title: 'Question #2',
          content: 'Câu hỏi demo #2: làm sao để ...?',
          authorId: '00000000-0000-4000-8000-0000000003ec',
          avatarUrl: null,
          author: { id: '00000000-0000-4000-8000-0000000003ec', name: 'User Seed 3', email: 'user3@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/user3.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      total: 20,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/questions/my — Get my questions
// ========================
export const GET_MY_QUESTIONS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách câu hỏi của tôi',
  description: 'Lấy danh sách câu hỏi do user hiện tại tạo.',
});

export const GET_MY_QUESTIONS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách câu hỏi của tôi thành công',
  schema: {
    example: {
      data: [
        {
          id: 1,
          title: 'Question #1',
          content: 'Câu hỏi demo #1: làm sao để ...?',
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      total: 3,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/questions/:id — Get question by ID
// ========================
export const GET_QUESTION_OPERATION = ApiOperation({
  summary: 'Lấy chi tiết câu hỏi theo ID',
  description: 'Lấy thông tin chi tiết của một câu hỏi bao gồm thông tin tác giả.',
});

export const QUESTION_ID_PARAM = ApiParam({
  name: 'id',
  description: 'ID của câu hỏi',
  example: 1,
  type: 'number',
});

export const GET_QUESTION_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy câu hỏi thành công',
  schema: {
    example: {
      id: 1,
      title: 'Question #1',
      content: 'Câu hỏi demo #1: làm sao để ...?',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const GET_QUESTION_ERROR_RESPONSES = {
  NOT_FOUND: ApiResponse({
    status: 404,
    description: 'Không tìm thấy câu hỏi',
    schema: {
      example: { statusCode: 404, message: 'Question not found', error: 'Not Found' },
    },
  }),
};

// ========================
// PATCH /client/questions/:id — Update question
// ========================
export const UPDATE_QUESTION_OPERATION = ApiOperation({
  summary: 'Cập nhật câu hỏi',
  description: 'Cập nhật tiêu đề và/hoặc nội dung câu hỏi. Chỉ tác giả mới được phép.',
});

export const UPDATE_QUESTION_RESPONSE = ApiResponse({
  status: 200,
  description: 'Cập nhật câu hỏi thành công',
  schema: {
    example: {
      id: 1,
      title: 'Question #1 (đã cập nhật)',
      content: 'Câu hỏi đã được cập nhật nội dung mới.',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// DELETE /client/questions/:id — Delete question
// ========================
export const DELETE_QUESTION_OPERATION = ApiOperation({
  summary: 'Xóa câu hỏi',
  description: 'Xóa câu hỏi. Chỉ tác giả hoặc admin mới được phép.',
});

export const DELETE_QUESTION_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xóa câu hỏi thành công',
  schema: {
    example: { message: 'Question deleted successfully' },
  },
});
