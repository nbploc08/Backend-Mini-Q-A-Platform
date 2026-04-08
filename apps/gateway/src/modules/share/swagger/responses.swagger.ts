import { ApiResponse } from '@nestjs/swagger';

export const UNAUTHORIZED_RESPONSE = ApiResponse({
  status: 401,
  description: 'Chưa xác thực hoặc token không hợp lệ',
  schema: {
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  },
});

export const FORBIDDEN_RESPONSE = ApiResponse({
  status: 403,
  description: 'Không có quyền truy cập',
  schema: {
    example: {
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden',
    },
  },
});

export const NOT_FOUND_RESPONSE = (resource: string) =>
  ApiResponse({
    status: 404,
    description: `Không tìm thấy ${resource}`,
    schema: {
      example: {
        statusCode: 404,
        message: `Không tìm thấy ${resource}`,
        error: 'Not Found',
      },
    },
  });

export const BAD_REQUEST_RESPONSE = ApiResponse({
  status: 400,
  description: 'Dữ liệu không hợp lệ',
  schema: {
    example: {
      statusCode: 400,
      message: ['dữ liệu không hợp lệ'],
      error: 'Bad Request',
    },
  },
});

export const TOO_MANY_REQUESTS_RESPONSE = ApiResponse({
  status: 429,
  description: 'Quá nhiều request, vui lòng thử lại sau',
  schema: {
    example: {
      statusCode: 429,
      message: 'Too Many Requests',
      error: 'Too Many Requests',
    },
  },
});

export const INTERNAL_SERVER_ERROR_RESPONSE = ApiResponse({
  status: 500,
  description: 'Lỗi hệ thống',
  schema: {
    example: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    },
  },
});

export const SUCCESS_DELETE_RESPONSE = (resource: string) =>
  ApiResponse({
    status: 200,
    description: `${resource} đã được xóa thành công`,
  });
