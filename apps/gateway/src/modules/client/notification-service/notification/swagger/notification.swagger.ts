import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

// ========================
// GET /client/notification/healthz — Health check
// ========================
export const NOTIFICATION_HEALTH_OPERATION = ApiOperation({
  summary: 'Health check notification service',
  description: 'Kiểm tra trạng thái hoạt động của notification service.',
});

export const NOTIFICATION_HEALTH_RESPONSE = ApiResponse({
  status: 200,
  description: 'Service hoạt động bình thường',
  schema: {
    example: { status: 'ok' },
  },
});

// ========================
// POST /client/notification — Create notification
// ========================
export const CREATE_NOTIFICATION_OPERATION = ApiOperation({
  summary: 'Tạo notification mới',
  description: 'Tạo một notification mới. Cần đăng nhập.',
});

export const CREATE_NOTIFICATION_RESPONSE = ApiResponse({
  status: 201,
  description: 'Tạo notification thành công',
  schema: {
    example: {
      id: 'notif_123',
      type: 'COMMENT',
      message: 'Có người bình luận bài viết của bạn',
      isRead: false,
      userId: 'clxyz1234567890',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

// ========================
// GET /client/notification — Get all notifications
// ========================
export const GET_ALL_NOTIFICATIONS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách notification',
  description: 'Lấy danh sách notification của user hiện tại, hỗ trợ phân trang và sắp xếp.',
});

export const NOTIFICATIONS_QUERY_PAGE = ApiQuery({
  name: 'page',
  required: false,
  type: String,
  example: '1',
  description: 'Số trang (mặc định 1)',
});

export const NOTIFICATIONS_QUERY_LIMIT = ApiQuery({
  name: 'limit',
  required: false,
  type: String,
  example: '10',
  description: 'Số notification mỗi trang (mặc định 10)',
});

export const NOTIFICATIONS_QUERY_SORT_BY = ApiQuery({
  name: 'sortBy',
  required: false,
  type: String,
  example: 'createdAt',
  description: 'Trường sắp xếp (mặc định createdAt)',
});

export const NOTIFICATIONS_QUERY_SORT_ORDER = ApiQuery({
  name: 'sortOrder',
  required: false,
  type: String,
  enum: ['asc', 'desc'],
  example: 'desc',
  description: 'Thứ tự sắp xếp (mặc định desc)',
});

export const GET_ALL_NOTIFICATIONS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách notification thành công',
  schema: {
    example: {
      data: [
        {
          id: 'notif_123',
          type: 'COMMENT',
          message: 'Có người bình luận bài viết của bạn',
          isRead: false,
          userId: 'clxyz1234567890',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'notif_124',
          type: 'POST_APPROVED',
          message: 'Bài viết của bạn đã được duyệt',
          isRead: true,
          userId: 'clxyz1234567890',
          createdAt: '2025-01-01T01:00:00.000Z',
        },
      ],
      total: 20,
      page: 1,
      limit: 10,
    },
  },
});

// ========================
// GET /client/notification/unread-count
// ========================
export const GET_UNREAD_COUNT_OPERATION = ApiOperation({
  summary: 'Lấy số notification chưa đọc',
  description: 'Trả về tổng số notification chưa đọc của user hiện tại.',
});

export const GET_UNREAD_COUNT_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy số notification chưa đọc thành công',
  schema: {
    example: { count: 5 },
  },
});

// ========================
// POST /client/notification/:id/read — Mark as read
// ========================
export const MARK_READ_OPERATION = ApiOperation({
  summary: 'Đánh dấu notification đã đọc',
  description: 'Đánh dấu một notification cụ thể là đã đọc.',
});

export const NOTIFICATION_ID_PARAM = ApiParam({
  name: 'id',
  description: 'ID của notification',
  example: 'notif_123',
  type: 'string',
});

export const MARK_READ_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đánh dấu đã đọc thành công',
  schema: {
    example: { message: 'Notification marked as read' },
  },
});

// ========================
// POST /client/notification/read-all — Mark all as read
// ========================
export const READ_ALL_OPERATION = ApiOperation({
  summary: 'Đánh dấu tất cả notification đã đọc',
  description: 'Đánh dấu tất cả notification của user hiện tại là đã đọc.',
});

export const READ_ALL_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đánh dấu tất cả đã đọc thành công',
  schema: {
    example: { message: 'All notifications marked as read', count: 5 },
  },
});
