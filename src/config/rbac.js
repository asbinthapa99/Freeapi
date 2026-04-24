const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  admin: [
    'users:read',
    'users:write',
    'payments:create',
    'documents:verify',
    'health:sync',
    'jobs:write',
    'metrics:read'
  ],
  operator: [
    'payments:create',
    'documents:verify',
    'health:sync',
    'jobs:write'
  ],
  analyst: [
    'users:read',
    'metrics:read'
  ],
  viewer: []
};

const DEFAULT_ROLE = process.env.DEFAULT_USER_ROLE || 'viewer';

const expandPermissions = (roles = [], directPermissions = []) => {
  const permissions = new Set(directPermissions);

  roles.forEach((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach((permission) => permissions.add(permission));
  });

  return Array.from(permissions);
};

const hasPermission = (user, permission) => {
  if (!user) {
    return false;
  }

  const permissions = expandPermissions(user.roles || [], user.permissions || []);
  return permissions.includes('*') || permissions.includes(permission);
};

module.exports = {
  DEFAULT_ROLE,
  ROLE_PERMISSIONS,
  expandPermissions,
  hasPermission
};
