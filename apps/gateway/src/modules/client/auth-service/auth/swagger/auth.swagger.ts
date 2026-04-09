import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

// ========================
// POST /client/auth/login
// ========================
export const LOGIN_OPERATION = ApiOperation({
  summary: 'Đăng nhập tài khoản',
  description:
    'Xác thực người dùng bằng email và password. Trả về access_token trong body và set refreshToken + deviceId vào cookie HttpOnly.\n\n**Tài khoản test (seed):**\n- Admin: `admin@example.com` / `Admin@123`\n- Moderator: `moderator@example.com` / `Mod@1234`\n- User: `user1@example.com` .. `user10@example.com` / `User@1234`',
});

export const LOGIN_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      password: { type: 'string', example: 'Admin@123' },
    },
  },
});

export const LOGIN_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đăng nhập thành công',
  schema: {
    example: {
      id: '00000000-0000-4000-8000-0000000003e8',
      email: 'admin@example.com',
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
});

export const LOGIN_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Email hoặc password không hợp lệ',
    schema: {
      example: { statusCode: 400, message: ['email must be an email'], error: 'Bad Request' },
    },
  }),
  UNAUTHORIZED: ApiResponse({
    status: 401,
    description: 'Sai email hoặc password',
    schema: {
      example: { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' },
    },
  }),
  TOO_MANY_REQUESTS: ApiResponse({
    status: 429,
    description: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau',
    schema: {
      example: { statusCode: 429, message: 'Too Many Requests', error: 'Too Many Requests' },
    },
  }),
};

// ========================
// POST /client/auth/register
// ========================
export const REGISTER_OPERATION = ApiOperation({
  summary: 'Đăng ký tài khoản mới',
  description:
    'Tạo tài khoản mới với email và password. Hỗ trợ idempotency key qua header. Sau khi đăng ký cần verify email.',
});

export const REGISTER_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'newuser@example.com' },
      password: { type: 'string', example: 'User@1234' },
    },
  },
});

export const REGISTER_RESPONSE = ApiResponse({
  status: 201,
  description: 'Đăng ký thành công, cần verify email',
  schema: {
    example: {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    },
  },
});

export const REGISTER_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: { statusCode: 400, message: ['email must be an email'], error: 'Bad Request' },
    },
  }),
  CONFLICT: ApiResponse({
    status: 409,
    description: 'Email đã tồn tại',
    schema: {
      example: { statusCode: 409, message: 'Email already exists', error: 'Conflict' },
    },
  }),
  TOO_MANY_REQUESTS: ApiResponse({
    status: 429,
    description: 'Quá nhiều lần đăng ký, vui lòng thử lại sau',
    schema: {
      example: { statusCode: 429, message: 'Too Many Requests', error: 'Too Many Requests' },
    },
  }),
};

// ========================
// POST /client/auth/register/verify
// ========================
export const VERIFY_OPERATION = ApiOperation({
  summary: 'Xác thực email đăng ký',
  description: 'Verify email bằng mã code được gửi qua email sau khi đăng ký.',
});

export const VERIFY_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'code'],
    properties: {
      email: { type: 'string', format: 'email', example: 'newuser@example.com' },
      code: { type: 'string', example: '123456' },
    },
  },
});

export const VERIFY_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xác thực email thành công',
  schema: {
    example: { message: 'Email verified successfully' },
  },
});

export const VERIFY_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Mã xác thực không hợp lệ hoặc đã hết hạn',
    schema: {
      example: { statusCode: 400, message: 'Invalid or expired verification code', error: 'Bad Request' },
    },
  }),
};

// ========================
// POST /client/auth/register/verify/confirm
// ========================
export const CONFIRM_OPERATION = ApiOperation({
  summary: 'Xác nhận hoàn tất đăng ký',
  description: 'Xác nhận hoàn tất quá trình đăng ký sau khi đã verify email.',
});

export const CONFIRM_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'code'],
    properties: {
      email: { type: 'string', format: 'email', example: 'newuser@example.com' },
      code: { type: 'string', example: '123456' },
    },
  },
});

export const CONFIRM_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xác nhận thành công',
  schema: {
    example: { message: 'Registration confirmed successfully' },
  },
});

// ========================
// POST /client/auth/resend-code
// ========================
export const RESEND_CODE_OPERATION = ApiOperation({
  summary: 'Gửi lại mã xác thực',
  description: 'Gửi lại mã xác thực email. Giới hạn 2 lần/phút cho mỗi email.',
});

export const RESEND_CODE_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user1@example.com' },
    },
  },
});

export const RESEND_CODE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đã gửi lại mã xác thực',
  schema: {
    example: { message: 'Verification code resent successfully' },
  },
});

export const RESEND_CODE_ERROR_RESPONSES = {
  TOO_MANY_REQUESTS: ApiResponse({
    status: 429,
    description: 'Quá nhiều lần gửi, vui lòng đợi',
    schema: {
      example: { statusCode: 429, message: 'Too Many Requests', error: 'Too Many Requests' },
    },
  }),
};

// ========================
// GET /client/auth/me
// ========================
export const GET_ME_OPERATION = ApiOperation({
  summary: 'Lấy thông tin profile người dùng',
  description: 'Trả về thông tin profile của user đang đăng nhập dựa trên JWT token.',
});

export const GET_ME_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy profile thành công',
  schema: {
    example: {
      id: '00000000-0000-4000-8000-0000000003e8',
      email: 'admin@example.com',
      name: 'Admin Seed',
      phone: '0901000001',
      age: 30,
      address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      isActive: true,
    },
  },
});

// ========================
// POST /client/auth/refresh
// ========================
export const REFRESH_OPERATION = ApiOperation({
  summary: 'Làm mới access token',
  description:
    'Sử dụng refreshToken và deviceId từ cookie để lấy access_token mới. Cookie sẽ được cập nhật với token mới.',
});

export const REFRESH_RESPONSE = ApiResponse({
  status: 200,
  description: 'Refresh token thành công',
  schema: {
    example: {
      id: '00000000-0000-4000-8000-0000000003e8',
      email: 'admin@example.com',
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
});

export const REFRESH_ERROR_RESPONSES = {
  UNAUTHORIZED: ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
    schema: {
      example: { statusCode: 401, message: 'Invalid refresh token', error: 'Unauthorized' },
    },
  }),
  TOO_MANY_REQUESTS: ApiResponse({
    status: 429,
    description: 'Quá nhiều request refresh',
    schema: {
      example: { statusCode: 429, message: 'Too Many Requests', error: 'Too Many Requests' },
    },
  }),
};

// ========================
// POST /client/auth/logout-device
// ========================
export const LOGOUT_DEVICE_OPERATION = ApiOperation({
  summary: 'Đăng xuất thiết bị hiện tại',
  description: 'Đăng xuất thiết bị hiện tại, xóa refreshToken và deviceId cookie.',
});

export const LOGOUT_DEVICE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đăng xuất thành công',
  schema: {
    example: 'logout success',
  },
});

// ========================
// POST /client/auth/logout-all
// ========================
export const LOGOUT_ALL_OPERATION = ApiOperation({
  summary: 'Đăng xuất tất cả thiết bị',
  description: 'Đăng xuất tất cả thiết bị của user, vô hiệu hóa toàn bộ refresh token.',
});

export const LOGOUT_ALL_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đăng xuất tất cả thiết bị thành công',
  schema: {
    example: 'logout success',
  },
});

// ========================
// POST /client/auth/forgot/password
// ========================
export const FORGOT_PASSWORD_OPERATION = ApiOperation({
  summary: 'Yêu cầu đặt lại mật khẩu',
  description: 'Gửi mã xác thực đến email để đặt lại mật khẩu. Giới hạn 2 lần/10 phút.',
});

export const FORGOT_PASSWORD_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user1@example.com' },
    },
  },
});

export const FORGOT_PASSWORD_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đã gửi mã xác thực đến email',
  schema: {
    example: { message: 'Password reset code sent to email' },
  },
});

export const FORGOT_PASSWORD_ERROR_RESPONSES = {
  NOT_FOUND: ApiResponse({
    status: 404,
    description: 'Email không tồn tại trong hệ thống',
    schema: {
      example: { statusCode: 404, message: 'User not found', error: 'Not Found' },
    },
  }),
  TOO_MANY_REQUESTS: ApiResponse({
    status: 429,
    description: 'Quá nhiều lần yêu cầu',
    schema: {
      example: { statusCode: 429, message: 'Too Many Requests', error: 'Too Many Requests' },
    },
  }),
};

// ========================
// POST /client/auth/forgot/password/verify
// ========================
export const FORGOT_PASSWORD_VERIFY_OPERATION = ApiOperation({
  summary: 'Xác thực mã đặt lại mật khẩu',
  description: 'Xác thực mã code gửi qua email cho quá trình đặt lại mật khẩu.',
});

export const FORGOT_PASSWORD_VERIFY_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'code'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user1@example.com' },
      code: { type: 'string', example: '123456' },
    },
  },
});

export const FORGOT_PASSWORD_VERIFY_RESPONSE = ApiResponse({
  status: 200,
  description: 'Mã hợp lệ',
  schema: {
    example: { message: 'Code verified successfully' },
  },
});

// ========================
// POST /client/auth/forgot/password/reset
// ========================
export const FORGOT_PASSWORD_RESET_OPERATION = ApiOperation({
  summary: 'Đặt lại mật khẩu',
  description: 'Đặt lại mật khẩu mới sau khi đã verify mã code thành công.',
});

export const FORGOT_PASSWORD_RESET_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['email', 'code', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user1@example.com' },
      code: { type: 'string', example: '123456' },
      password: { type: 'string', example: 'NewStrongP@ss456' },
    },
  },
});

export const FORGOT_PASSWORD_RESET_RESPONSE = ApiResponse({
  status: 200,
  description: 'Đặt lại mật khẩu thành công',
  schema: {
    example: { message: 'Password reset successfully' },
  },
});

export const FORGOT_PASSWORD_RESET_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Mã không hợp lệ hoặc đã hết hạn',
    schema: {
      example: { statusCode: 400, message: 'Invalid or expired code', error: 'Bad Request' },
    },
  }),
};
