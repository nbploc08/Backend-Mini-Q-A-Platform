import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// ========================
// POST /client/roles — Create role
// ========================
export const CREATE_ROLE_OPERATION = ApiOperation({
  summary: 'Tạo role mới',
  description: 'Tạo một role mới với tên, mô tả và danh sách permission IDs tùy chọn.',
});

export const CREATE_ROLE_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'editor' },
      description: { type: 'string', example: 'Người biên tập nội dung' },
      permissionIds: {
        type: 'array',
        items: { type: 'string' },
        example: ['perm_1', 'perm_2'],
      },
    },
  },
});

export const CREATE_ROLE_RESPONSE = ApiResponse({
  status: 201,
  description: 'Tạo role thành công',
  schema: {
    example: {
      id: 'clxyz1234567890',
      name: 'editor',
      description: 'Người biên tập nội dung',
      permissions: [
        { id: 'perm_1', code: 'user:read', description: 'Xem thông tin user' },
        { id: 'perm_2', code: 'user:update', description: 'Cập nhật thông tin user' },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

export const CREATE_ROLE_ERROR_RESPONSES = {
  BAD_REQUEST: ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: { statusCode: 400, message: 'Role name is required', error: 'Bad Request' },
    },
  }),
  CONFLICT: ApiResponse({
    status: 409,
    description: 'Role đã tồn tại',
    schema: {
      example: { statusCode: 409, message: 'Role already exists', error: 'Conflict' },
    },
  }),
};

// ========================
// GET /client/roles — Get all roles
// ========================
export const GET_ALL_ROLES_OPERATION = ApiOperation({
  summary: 'Lấy danh sách tất cả roles',
  description: 'Trả về danh sách tất cả roles trong hệ thống kèm permissions.\n\n**Roles (seed):** admin, moderator, user',
});

export const GET_ALL_ROLES_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách roles thành công',
  schema: {
    example: [
      {
        id: 'role_uuid_1',
        name: 'admin',
        description: 'Admin - toàn quyền hệ thống',
        permissions: [
          { id: 'perm_1', code: 'user:read', description: 'Xem thông tin user' },
          { id: 'perm_2', code: 'admin:manage-users', description: 'Quản lý tài khoản người dùng' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role_uuid_2',
        name: 'moderator',
        description: 'Moderator - duyệt bài viết',
        permissions: [
          { id: 'perm_3', code: 'posts:moderate', description: 'Duyệt / từ chối bài viết' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role_uuid_3',
        name: 'user',
        description: 'User thường - quyền cơ bản',
        permissions: [
          { id: 'perm_4', code: 'user:read', description: 'Xem thông tin user' },
          { id: 'perm_5', code: 'notifications:read', description: 'Xem danh sách thông báo và unread count' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
  },
});

// ========================
// GET /client/roles/:id — Get role by ID
// ========================
export const GET_ROLE_OPERATION = ApiOperation({
  summary: 'Lấy thông tin role theo ID',
  description: 'Trả về thông tin chi tiết của một role bao gồm permissions.',
});

export const ROLE_ID_PARAM = ApiParam({
  name: 'id',
  description: 'ID của role',
  example: 'role_uuid_1',
  type: 'string',
});

export const GET_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy role thành công',
  schema: {
    example: {
      id: 'role_uuid_1',
      name: 'admin',
      description: 'Admin - toàn quyền hệ thống',
      permissions: [
        { id: 'perm_1', code: 'user:read', description: 'Xem thông tin user' },
        { id: 'perm_2', code: 'user:create', description: 'Tạo user mới' },
        { id: 'perm_3', code: 'admin:manage-users', description: 'Quản lý tài khoản người dùng' },
        { id: 'perm_4', code: 'admin:manage-roles', description: 'Quản lý vai trò và phân quyền' },
        { id: 'perm_5', code: 'posts:moderate', description: 'Duyệt / từ chối bài viết' },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
});

// ========================
// PATCH /client/roles/:id — Update role
// ========================
export const UPDATE_ROLE_OPERATION = ApiOperation({
  summary: 'Cập nhật thông tin role',
  description: 'Cập nhật tên, mô tả hoặc danh sách permission IDs của role.',
});

export const UPDATE_ROLE_BODY = ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'senior-moderator' },
      description: { type: 'string', example: 'Moderator cao cấp' },
      permissionIds: {
        type: 'array',
        items: { type: 'string' },
        example: ['perm_1', 'perm_2', 'perm_3'],
      },
    },
  },
});

export const UPDATE_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Cập nhật role thành công',
  schema: {
    example: {
      id: 'clxyz1234567890',
      name: 'senior-moderator',
      description: 'Moderator cao cấp',
      permissions: [
        { id: 'perm_1', code: 'user:read', description: 'Xem thông tin user' },
        { id: 'perm_2', code: 'posts:moderate', description: 'Duyệt / từ chối bài viết' },
        { id: 'perm_3', code: 'notifications:write', description: 'Đánh dấu đọc / read-all thông báo' },
      ],
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  },
});

// ========================
// DELETE /client/roles/:id — Delete role
// ========================
export const DELETE_ROLE_OPERATION = ApiOperation({
  summary: 'Xóa role',
  description: 'Xóa hoàn toàn một role khỏi hệ thống.',
});

export const DELETE_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Xóa role thành công',
  schema: {
    example: { message: 'Role deleted successfully' },
  },
});

// ========================
// GET /client/roles/users/:userId/roles
// ========================
export const GET_USER_ROLES_OPERATION = ApiOperation({
  summary: 'Lấy danh sách roles của user',
  description: 'Trả về danh sách tất cả roles được gán cho một user.',
});

export const USER_ID_PARAM = ApiParam({
  name: 'userId',
  description: 'ID của user',
  example: '00000000-0000-4000-8000-0000000003e8',
  type: 'string',
});

export const GET_USER_ROLES_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy roles của user thành công',
  schema: {
    example: [
      { id: 'role_uuid_1', name: 'admin', description: 'Admin - toàn quyền hệ thống' },
    ],
  },
});

// ========================
// GET /client/roles/users/:userId/permissions
// ========================
export const GET_USER_PERMISSIONS_OPERATION = ApiOperation({
  summary: 'Lấy danh sách permissions của user',
  description: 'Trả về danh sách tất cả permissions (gộp từ tất cả roles) của một user.',
});

export const GET_USER_PERMISSIONS_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy permissions của user thành công',
  schema: {
    example: [
      { id: 'perm_1', code: 'user:read', description: 'Xem thông tin user' },
      { id: 'perm_2', code: 'user:create', description: 'Tạo user mới' },
      { id: 'perm_3', code: 'notifications:read', description: 'Xem danh sách thông báo và unread count' },
      { id: 'perm_4', code: 'admin:manage-users', description: 'Quản lý tài khoản người dùng' },
      { id: 'perm_5', code: 'posts:moderate', description: 'Duyệt / từ chối bài viết' },
    ],
  },
});

// ========================
// POST /client/roles/assign-role
// ========================
export const ASSIGN_ROLE_OPERATION = ApiOperation({
  summary: 'Gán role cho user',
  description: 'Gán một role cho user dựa trên userId và roleName.',
});

export const ASSIGN_ROLE_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['userId', 'roleName'],
    properties: {
      userId: { type: 'string', example: '00000000-0000-4000-8000-0000000003ea' },
      roleName: { type: 'string', example: 'moderator' },
    },
  },
});

export const ASSIGN_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Gán role thành công',
  schema: {
    example: { message: 'Role assigned successfully' },
  },
});

export const ASSIGN_ROLE_ERROR_RESPONSES = {
  NOT_FOUND: ApiResponse({
    status: 404,
    description: 'User hoặc role không tồn tại',
    schema: {
      example: { statusCode: 404, message: 'User or role not found', error: 'Not Found' },
    },
  }),
  CONFLICT: ApiResponse({
    status: 409,
    description: 'User đã có role này',
    schema: {
      example: { statusCode: 409, message: 'User already has this role', error: 'Conflict' },
    },
  }),
};

// ========================
// POST /client/roles/unassign-role
// ========================
export const UNASSIGN_ROLE_OPERATION = ApiOperation({
  summary: 'Gỡ role khỏi user',
  description: 'Gỡ bỏ một role đã gán cho user.',
});

export const UNASSIGN_ROLE_BODY = ApiBody({
  schema: {
    type: 'object',
    required: ['userId', 'roleName'],
    properties: {
      userId: { type: 'string', example: '00000000-0000-4000-8000-0000000003ea' },
      roleName: { type: 'string', example: 'moderator' },
    },
  },
});

export const UNASSIGN_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Gỡ role thành công',
  schema: {
    example: { message: 'Role unassigned successfully' },
  },
});
