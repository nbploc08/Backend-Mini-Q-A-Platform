import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// ========================
// POST /client/posts — Create post
// ========================
export const CREATE_POST_OPERATION = ApiOperation({
  summary: 'Tạo bài viết mới',
  description: 'Tạo bài viết mới với trạng thái mặc định là DRAFT. Cần đăng nhập.',
});

export const CREATE_POST_RESPONSE = ApiResponse({
  status: 201,
  description: 'Tạo bài viết thành công',
  schema: {
    example: {
      id: 31,
      title: 'Post #31',
      content: 'Nội dung demo cho post #31. Đây là bài viết mẫu phục vụ seed data.',
      status: 'DRAFT',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const CREATE_POST_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: { statusCode: 400, message: ['title should not be empty'], error: 'Bad Request' },
    },
  }),
};

// ========================
// GET /client/posts — Get all posts
// ========================
export const GET_ALL_POSTS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách bài viết',
  description: 'Lấy danh sách bài viết với phân trang và lọc theo trạng thái. Public API.',
});

export const POSTS_QUERY_PAGE = ApiQuery({
  name: 'page',
  required: false,
  type: String,
  example: '1',
  description: 'Số trang (mặc định 1)',
});

export const POSTS_QUERY_PER_PAGE = ApiQuery({
  name: 'per_page',
  required: false,
  type: String,
  example: '10',
  description: 'Số bài viết mỗi trang (mặc định 10)',
});

export const POSTS_QUERY_STATUS = ApiQuery({
  name: 'status',
  required: false,
  type: String,
  enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
  example: 'APPROVED',
  description: 'Lọc theo trạng thái bài viết',
});

export const GET_ALL_POSTS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách bài viết thành công',
  schema: {
    example: {
      data: [
        {
          id: 1,
          title: 'Post #1',
          content: 'Nội dung demo cho post #1. Đây là bài viết mẫu phục vụ seed data.',
          status: 'PENDING',
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          title: 'Post #2',
          content: 'Nội dung demo cho post #2. Đây là bài viết mẫu phục vụ seed data.',
          status: 'APPROVED',
          authorId: '00000000-0000-4000-8000-0000000003e9',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/moderator.jpg',
          author: { id: '00000000-0000-4000-8000-0000000003e9', name: 'Moderator Seed', email: 'moderator@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/moderator.jpg' },
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      total: 30,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/posts/my — Get my posts
// ========================
export const GET_MY_POSTS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách bài viết của tôi',
  description: 'Lấy danh sách bài viết do user hiện tại tạo, hỗ trợ lọc theo trạng thái.',
});

export const GET_MY_POSTS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách bài viết của tôi thành công',
  schema: {
    example: {
      data: [
        {
          id: 1,
          title: 'Post #1',
          content: 'Nội dung demo cho post #1. Đây là bài viết mẫu phục vụ seed data.',
          status: 'PENDING',
          authorId: '00000000-0000-4000-8000-0000000003e8',
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      total: 5,
      page: 1,
      per_page: 10,
    },
  },
});

// ========================
// GET /client/posts/:id — Get post by ID
// ========================
export const GET_POST_OPERATION = ApiOperation({
  summary: 'Lấy chi tiết bài viết theo ID',
  description: 'Lấy thông tin chi tiết của một bài viết bao gồm thông tin tác giả.',
});

export const POST_ID_PARAM = ApiParam({
  name: 'id',
  description: 'ID của bài viết',
  example: 1,
  type: 'number',
});

export const GET_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy bài viết thành công',
  schema: {
    example: {
      id: 1,
      title: 'Post #1',
      content: 'Nội dung demo cho post #1. Đây là bài viết mẫu phục vụ seed data.',
      status: 'PENDING',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      author: { id: '00000000-0000-4000-8000-0000000003e8', name: 'Admin Seed', email: 'admin@example.com', avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg' },
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const GET_POST_ERROR_RESPONSES = {
  NOT_FOUND: ApiResponse({
    status: 404,
    description: 'Không tìm thấy bài viết',
    schema: {
      example: { statusCode: 404, message: 'Post not found', error: 'Not Found' },
    },
  }),
};

// ========================
// PATCH /client/posts/:id — Update post
// ========================
export const UPDATE_POST_OPERATION = ApiOperation({
  summary: 'Cập nhật bài viết',
  description: 'Cập nhật tiêu đề và/hoặc nội dung bài viết. Chỉ tác giả mới được phép.',
});

export const UPDATE_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Cập nhật bài viết thành công',
  schema: {
    example: {
      id: 1,
      title: 'Post #1 (đã cập nhật)',
      content: 'Nội dung đã cập nhật cho post #1.',
      status: 'DRAFT',
      authorId: '00000000-0000-4000-8000-0000000003e8',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// PATCH /client/posts/:id/submit — Submit post for review
// ========================
export const SUBMIT_POST_OPERATION = ApiOperation({
  summary: 'Gửi bài viết để duyệt',
  description: 'Chuyển trạng thái bài viết từ DRAFT sang PENDING để chờ admin duyệt.',
});

export const SUBMIT_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Gửi bài viết để duyệt thành công',
  schema: {
    example: {
      id: 1,
      title: 'Post #1',
      status: 'PENDING',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// PATCH /client/posts/:id/approve — Approve post
// ========================
export const APPROVE_POST_OPERATION = ApiOperation({
  summary: 'Duyệt bài viết',
  description: 'Admin duyệt bài viết, chuyển trạng thái sang APPROVED.',
});

export const APPROVE_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Duyệt bài viết thành công',
  schema: {
    example: {
      id: 1,
      title: 'Post #1',
      status: 'APPROVED',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// PATCH /client/posts/:id/reject — Reject post
// ========================
export const REJECT_POST_OPERATION = ApiOperation({
  summary: 'Từ chối bài viết',
  description: 'Admin từ chối bài viết, chuyển trạng thái sang REJECTED.',
});

export const REJECT_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Từ chối bài viết thành công',
  schema: {
    example: {
      id: 1,
      title: 'Post #1',
      status: 'REJECTED',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/admin.jpg',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// DELETE /client/posts/:id — Delete post
// ========================
export const DELETE_POST_OPERATION = ApiOperation({
  summary: 'Xóa bài viết',
  description: 'Xóa bài viết. Chỉ tác giả hoặc admin mới được phép.',
});

export const DELETE_POST_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xóa bài viết thành công',
  schema: {
    example: { message: 'Post deleted successfully' },
  },
});
