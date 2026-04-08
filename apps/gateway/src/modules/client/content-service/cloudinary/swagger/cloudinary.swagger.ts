import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

// ========================
// GET /client/cloudinary/images
// ========================
export const GET_IMAGES_OPERATION = ApiOperation({
  summary: 'Lấy danh sách tất cả ảnh',
  description: 'Trả về danh sách tất cả ảnh đã upload lên Cloudinary.',
});

export const GET_IMAGES_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách ảnh thành công',
  schema: {
    example: {
      resources: [
        {
          public_id: 'sample_image_1',
          url: 'https://res.cloudinary.com/demo/image/upload/v1/sample1.jpg',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/sample1.jpg',
          format: 'jpg',
          width: 800,
          height: 600,
          created_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    },
  },
});

// ========================
// POST /client/cloudinary/image/upload
// ========================
export const UPLOAD_IMAGE_OPERATION = ApiOperation({
  summary: 'Upload ảnh lên Cloudinary',
  description:
    'Upload một file ảnh lên Cloudinary. Hỗ trợ các định dạng: JPEG, PNG, GIF, WebP, SVG. Kích thước tối đa 5MB.',
});

export const UPLOAD_IMAGE_CONSUMES = ApiConsumes('multipart/form-data');

export const UPLOAD_IMAGE_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'File ảnh cần upload (max 5MB, format: jpeg/png/gif/webp/svg)',
      },
    },
  },
});

export const UPLOAD_IMAGE_RESPONSE = ApiResponse({
  status: 201,
  description: 'Upload ảnh thành công',
  schema: {
    example: {
      public_id: 'new_image_123',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/new_image_123.jpg',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/new_image_123.jpg',
      format: 'jpg',
      width: 1920,
      height: 1080,
      bytes: 245678,
      created_at: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const UPLOAD_IMAGE_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'File không hợp lệ (quá lớn hoặc sai định dạng)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (expected type is /^image\\/(jpeg|png|gif|webp|svg\\+xml)$/)',
        error: 'Bad Request',
      },
    },
  }),
  UNAUTHORIZED: ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
    schema: {
      example: { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
    },
  }),
};
