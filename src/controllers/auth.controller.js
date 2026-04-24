const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const session = await authService.login({
      email,
      password,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    });

    return res.json({
      status: 'success',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const session = await authService.refreshSession({
      refreshToken: req.body.refresh_token,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    });

    return res.json({
      status: 'success',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.revokeRefreshToken(req.body.refresh_token);
    return res.json({
      status: 'success',
      data: { revoked: true }
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    return res.json({
      status: 'success',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await authService.listUsers();
    return res.json({
      status: 'success',
      data: {
        count: users.length,
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await authService.register(req.body, { bypassPublicGuard: true });
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await authService.updateUser(req.params.user_id, req.body);
    return res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.params.user_id);
    return res.json({
      status: 'success',
      data: { deleted: true }
    });
  } catch (error) {
    next(error);
  }
};
