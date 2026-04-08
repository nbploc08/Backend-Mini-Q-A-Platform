import type { PrismaClient } from '.prisma/auth-client';

const ALL_PERMISSIONS = [
  // === PermissionCode enum (require-permission.decorator) ===
  { code: 'user:read', description: 'Xem thông tin user' },
  { code: 'user:create', description: 'Tạo user mới' },
  { code: 'user:update', description: 'Cập nhật thông tin user' },
  { code: 'user:delete', description: 'Xóa user' },
  { code: 'user:ban', description: 'Cấm tài khoản user' },
  { code: 'order:read', description: 'Xem đơn hàng' },
  { code: 'order:create', description: 'Tạo đơn hàng' },
  { code: 'order:refund', description: 'Hoàn tiền đơn hàng' },
  { code: 'product:read', description: 'Xem sản phẩm' },
  { code: 'product:create', description: 'Tạo sản phẩm' },
  { code: 'product:update', description: 'Cập nhật sản phẩm' },
  { code: 'product:delete', description: 'Xóa sản phẩm' },
  { code: 'notifications:read', description: 'Xem danh sách thông báo và unread count' },
  { code: 'notifications:write', description: 'Đánh dấu đọc / read-all thông báo' },
  { code: 'admin:manage-users', description: 'Quản lý tài khoản người dùng' },
  { code: 'admin:manage-roles', description: 'Quản lý vai trò và phân quyền' },
  { code: 'posts:moderate', description: 'Duyệt / từ chối bài viết' },
  // === Permission enum (permission.decorator — legacy) ===
  { code: 'event:create', description: 'Tạo sự kiện' },
  { code: 'event:read', description: 'Xem sự kiện' },
  { code: 'event:update', description: 'Cập nhật sự kiện' },
  { code: 'event:publish', description: 'Xuất bản sự kiện' },
  { code: 'event:delete', description: 'Xóa sự kiện' },
  { code: 'ticket:create', description: 'Tạo vé' },
  { code: 'ticket:update', description: 'Cập nhật vé' },
  { code: 'ticket-type:create', description: 'Tạo loại vé' },
  { code: 'ticket-type:update', description: 'Cập nhật loại vé' },
  { code: 'ticket-type:delete', description: 'Xóa loại vé' },
  { code: 'seat:create', description: 'Tạo chỗ ngồi' },
  { code: 'seat:update', description: 'Cập nhật chỗ ngồi' },
  { code: 'seat:delete', description: 'Xóa chỗ ngồi' },
  { code: 'checkin:scan', description: 'Quét check-in' },
] as const;

/** Permissions assigned to the "user" role */
const USER_PERMISSIONS = [
  'user:read',
  'order:read',
  'order:create',
  'product:read',
  'notifications:read',
];

/** Admin gets everything */
const ADMIN_PERMISSIONS = ALL_PERMISSIONS.map((p) => p.code);

export async function runRoleSeed(prisma: PrismaClient) {
  // 1. Upsert all permissions
  const permMap: Record<string, string> = {};
  for (const perm of ALL_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: { code: perm.code, description: perm.description },
    });
    permMap[perm.code] = record.id;
  }

  // 2. Roles
  const roleUser = await prisma.role.upsert({
    where: { name: 'user' },
    update: { description: 'User thường - quyền cơ bản' },
    create: { name: 'user', description: 'User thường - quyền cơ bản' },
  });
  const roleModerator = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: { description: 'Moderator - duyệt bài viết' },
    create: { name: 'moderator', description: 'Moderator - duyệt bài viết' },
  });
  const roleAdmin = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { description: 'Admin - toàn quyền hệ thống' },
    create: { name: 'admin', description: 'Admin - toàn quyền hệ thống' },
  });

  // 3. RolePermissions
  // User role
  for (const code of USER_PERMISSIONS) {
    const permissionId = permMap[code]!;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleUser.id, permissionId } },
      update: {},
      create: { roleId: roleUser.id, permissionId },
    });
  }

  // Moderator role: user perms + posts:moderate
  for (const code of [...USER_PERMISSIONS, 'posts:moderate']) {
    const permissionId = permMap[code]!;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleModerator.id, permissionId } },
      update: {},
      create: { roleId: roleModerator.id, permissionId },
    });
  }

  // Admin role: all permissions
  for (const code of ADMIN_PERMISSIONS) {
    const permissionId = permMap[code]!;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleAdmin.id, permissionId } },
      update: {},
      create: { roleId: roleAdmin.id, permissionId },
    });
  }

  console.log(
    `Role seed OK: ${ALL_PERMISSIONS.length} permissions; roles: user, moderator, admin.`,
  );
  return { roleUser, roleModerator, roleAdmin };
}
