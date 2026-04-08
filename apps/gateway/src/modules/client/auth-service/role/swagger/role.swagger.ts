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
      name: { type: 'string', example: 'EDITOR' },
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
      name: 'EDITOR',
      description: 'Người biên tập nội dung',
      permissions: [
        { id: 'perm_1', name: 'post:create' },
        { id: 'perm_2', name: 'post:update' },
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
  description: 'Trả về danh sách tất cả roles trong hệ thống kèm permissions.',
});

export const GET_ALL_ROLES_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy danh sách roles thành công',
  schema: {
    example: [
      {
        id: 'clxyz1234567890',
        name: 'ADMIN',
        description: 'Quản trị viên hệ thống',
        permissions: [{ id: 'perm_1', name: 'admin:all' }],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'clxyz0987654321',
        name: 'USER',
        description: 'Người dùng thường',
        permissions: [{ id: 'perm_2', name: 'post:read' }],
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
  example: 'clxyz1234567890',
  type: 'string',
});

export const GET_ROLE_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy role thành công',
  schema: {
    example: {
      id: 'clxyz1234567890',
      name: 'EDITOR',
      description: 'Người biên tập nội dung',
      permissions: [
        { id: 'perm_1', name: 'post:create' },
        { id: 'perm_2', name: 'post:update' },
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
      name: { type: 'string', example: 'SENIOR_EDITOR' },
      description: { type: 'string', example: 'Biên tập viên cao cấp' },
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
      name: 'SENIOR_EDITOR',
      description: 'Biên tập viên cao cấp',
      permissions: [
        { id: 'perm_1', name: 'post:create' },
        { id: 'perm_2', name: 'post:update' },
        { id: 'perm_3', name: 'post:delete' },
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
  example: 'clxyz1234567890',
  type: 'string',
});

export const GET_USER_ROLES_RESPONSE = ApiResponse({
  status: 200,
  description: 'Lấy roles của user thành công',
  schema: {
    example: [
      { id: 'clxyz1234567890', name: 'USER', description: 'Người dùng thường' },
      { id: 'clxyz0987654321', name: 'EDITOR', description: 'Biên tập viên' },
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
      { id: 'perm_1', name: 'post:create' },
      { id: 'perm_2', name: 'post:read' },
      { id: 'perm_3', name: 'comment:create' },
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
      userId: { type: 'string', example: 'clxyz1234567890' },
      roleName: { type: 'string', example: 'EDITOR' },
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
      userId: { type: 'string', example: 'clxyz1234567890' },
      roleName: { type: 'string', example: 'EDITOR' },
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
