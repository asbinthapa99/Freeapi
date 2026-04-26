const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const { readCollection, writeCollection } = require('./persistence.service');
const { DEFAULT_ROLE, ROLE_PERMISSIONS, expandPermissions } = require('../config/rbac');

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30;

const assertJwtConfigured = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured.');
    error.status = 500;
    error.code = 'AUTH_NOT_CONFIGURED';
    throw error;
  }
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const sanitizeUser = (user) => {
  const {
    password_hash,
    ...safeUser
  } = user;

  return {
    ...safeUser,
    permissions: expandPermissions(safeUser.roles || [], safeUser.permissions || [])
  };
};

const readUsers = async () => readCollection('users');
const writeUsers = async (users) => writeCollection('users', users);
const readRefreshTokens = async () => readCollection('refresh_tokens');
const writeRefreshTokens = async (tokens) => writeCollection('refresh_tokens', tokens);

const ensureBootstrapAdmin = async () => {
  const users = await readUsers();
  if (users.length > 0) {
    return null;
  }

  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || (!configuredPassword && !configuredHash)) {
    return null;
  }

  const password_hash = configuredHash || await bcrypt.hash(configuredPassword, 12);
  const bootstrapUser = {
    user_id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
    email: configuredEmail.toLowerCase(),
    full_name: process.env.ADMIN_NAME || 'Bootstrap Admin',
    roles: ['super_admin'],
    permissions: [],
    status: 'ACTIVE',
    password_hash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null
  };

  await writeUsers([bootstrapUser]);
  return sanitizeUser(bootstrapUser);
};

const findUserByEmail = async (email) => {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
};

const findUserById = async (userId) => {
  const users = await readUsers();
  return users.find((user) => user.user_id === userId) || null;
};

const issueTokens = async (user, context = {}) => {
  assertJwtConfigured();
  const sanitizedUser = sanitizeUser(user);
  const accessToken = jwt.sign(
    {
      sub: sanitizedUser.user_id,
      email: sanitizedUser.email,
      roles: sanitizedUser.roles,
      permissions: sanitizedUser.permissions,
      token_type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = crypto.randomBytes(48).toString('hex');
  const refreshTokens = await readRefreshTokens();
  const expiresAt = new Date(Date.now() + (REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)).toISOString();

  refreshTokens.push({
    token_id: `RT-${uuidv4().slice(0, 8).toUpperCase()}`,
    user_id: sanitizedUser.user_id,
    token_hash: sha256(refreshToken),
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
    revoked_at: null,
    replaced_by_token_id: null,
    user_agent: context.userAgent || null,
    ip_address: context.ipAddress || null
  });

  await writeRefreshTokens(refreshTokens);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL,
    user: sanitizedUser
  };
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  assertJwtConfigured();
  await ensureBootstrapAdmin();
  const user = await findUserByEmail(email);

  if (!user || user.status !== 'ACTIVE') {
    const error = new Error('Email or password is incorrect.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    const error = new Error('Email or password is incorrect.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const users = await readUsers();
  const updatedUsers = users.map((item) => (
    item.user_id === user.user_id
      ? { ...item, last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      : item
  ));
  await writeUsers(updatedUsers);

  return issueTokens(updatedUsers.find((item) => item.user_id === user.user_id), { userAgent, ipAddress });
};

const register = async ({ email, password, full_name, roles, permissions }, options = {}) => {
  const users = await readUsers();
  const allowPublicRegistration = process.env.ALLOW_PUBLIC_REGISTRATION === 'true';
  if (!options.bypassPublicGuard && users.length > 0 && !allowPublicRegistration) {
    const error = new Error('Public registration is disabled.');
    error.status = 403;
    error.code = 'REGISTRATION_DISABLED';
    throw error;
  }

  const normalizedEmail = email.toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error(`User ${normalizedEmail} already exists.`);
    error.status = 409;
    error.code = 'USER_EXISTS';
    throw error;
  }

  const selectedRoles = Array.isArray(roles) && roles.length > 0 ? roles : [DEFAULT_ROLE];
  const invalidRoles = selectedRoles.filter((role) => !ROLE_PERMISSIONS[role]);
  if (invalidRoles.length > 0) {
    const error = new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    error.status = 400;
    error.code = 'INVALID_ROLES';
    throw error;
  }

  const user = {
    user_id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
    email: normalizedEmail,
    full_name,
    roles: selectedRoles,
    permissions: Array.isArray(permissions) ? permissions : [],
    status: 'ACTIVE',
    password_hash: await bcrypt.hash(password, 12),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null
  };

  users.push(user);
  await writeUsers(users);
  return sanitizeUser(user);
};

const refreshSession = async ({ refreshToken, userAgent, ipAddress }) => {
  assertJwtConfigured();
  const refreshTokens = await readRefreshTokens();
  const tokenHash = sha256(refreshToken);
  const storedToken = refreshTokens.find((token) => token.token_hash === tokenHash);

  if (!storedToken || storedToken.revoked_at || new Date(storedToken.expires_at).getTime() < Date.now()) {
    const error = new Error('Refresh token is invalid or expired.');
    error.status = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const user = await findUserById(storedToken.user_id);
  if (!user || user.status !== 'ACTIVE') {
    const error = new Error('User account is inactive.');
    error.status = 401;
    error.code = 'USER_INACTIVE';
    throw error;
  }

  storedToken.revoked_at = new Date().toISOString();
  await writeRefreshTokens(refreshTokens);

  return issueTokens(user, { userAgent, ipAddress });
};

const revokeRefreshToken = async (refreshToken) => {
  const refreshTokens = await readRefreshTokens();
  const tokenHash = sha256(refreshToken);
  const updatedTokens = refreshTokens.map((token) => (
    token.token_hash === tokenHash
      ? { ...token, revoked_at: token.revoked_at || new Date().toISOString() }
      : token
  ));
  await writeRefreshTokens(updatedTokens);
};

const listUsers = async () => {
  const users = await readUsers();
  return users.map(sanitizeUser);
};

const updateUser = async (userId, updates = {}) => {
  const users = await readUsers();
  const currentUser = users.find((user) => user.user_id === userId);

  if (!currentUser) {
    const error = new Error(`User ${userId} not found.`);
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const nextRoles = updates.roles === undefined ? currentUser.roles : updates.roles;
  const invalidRoles = (nextRoles || []).filter((role) => !ROLE_PERMISSIONS[role]);
  if (invalidRoles.length > 0) {
    const error = new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    error.status = 400;
    error.code = 'INVALID_ROLES';
    throw error;
  }

  const updatedUsers = await Promise.all(users.map(async (user) => {
    if (user.user_id !== userId) {
      return user;
    }

    const nextUser = {
      ...user,
      full_name: updates.full_name !== undefined ? updates.full_name : user.full_name,
      email: updates.email !== undefined ? updates.email.toLowerCase() : user.email,
      roles: nextRoles,
      permissions: updates.permissions !== undefined ? updates.permissions : user.permissions,
      status: updates.status !== undefined ? updates.status : user.status,
      updated_at: new Date().toISOString()
    };

    if (updates.password) {
      nextUser.password_hash = await bcrypt.hash(updates.password, 12);
    }

    return nextUser;
  }));

  await writeUsers(updatedUsers);
  return sanitizeUser(updatedUsers.find((user) => user.user_id === userId));
};

const deleteUser = async (userId) => {
  const users = await readUsers();
  const filteredUsers = users.filter((user) => user.user_id !== userId);
  if (filteredUsers.length === users.length) {
    const error = new Error(`User ${userId} not found.`);
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  await writeUsers(filteredUsers);
};

module.exports = {
  ACCESS_TOKEN_TTL,
  ensureBootstrapAdmin,
  findUserByEmail,
  findUserById,
  issueTokens,
  listUsers,
  login,
  refreshSession,
  register,
  revokeRefreshToken,
  sanitizeUser,
  updateUser,
  deleteUser
};
