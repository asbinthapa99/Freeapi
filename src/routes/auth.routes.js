const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth, requirePermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  authLoginValidation,
  authRefreshValidation,
  authRegisterValidation,
  authUpdateUserValidation,
  authUserIdValidation
} = require('../validators/api.validators');

const router = express.Router();

router.post('/register', validate(authRegisterValidation), authController.register);
router.post('/login', validate(authLoginValidation), authController.login);
router.post('/refresh', validate(authRefreshValidation), authController.refresh);
router.post('/logout', validate(authRefreshValidation), authController.logout);
router.get('/me', requireAuth, authController.me);
router.get('/users', requireAuth, requirePermission('users:read'), authController.listUsers);
router.post('/users', requireAuth, requirePermission('users:write'), validate(authRegisterValidation), authController.createUser);
router.patch('/users/:user_id', requireAuth, requirePermission('users:write'), validate(authUpdateUserValidation), authController.updateUser);
router.delete('/users/:user_id', requireAuth, requirePermission('users:write'), validate(authUserIdValidation), authController.deleteUser);

module.exports = router;
