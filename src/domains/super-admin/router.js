import express from 'express';
import apiKeyVerifier from './middlewares/api-key-verifier.mid.js';
import identityVerifier from '../../middlewares/auth/identity-verifier.mid.js';
import validator from './middlewares/validator.mid.js';
import controller from './controller.js';

const router = express.Router();

// API key verification middleware for all admin routes
router.use(apiKeyVerifier);

router.post(
  '/signin',
  validator.authenticate,
  async (req, res, _next) => {
    await controller.authenticate(req, res);
  },
);

// Identity verifier middleware for the routes below
router.use(identityVerifier);

router.get(
  '/',
  async (req, res, _next) => {
    await controller.read(req, res);
  },
);

router.patch(
  '/',
  validator.update,
  async (req, res, _next) => {
    await controller.update(req, res);
  },
);

router.get(
  '/stats',
  async (req, res, _next) => {
    await controller.stats(req, res);
  },
);

router.post(
  '/paginated-find',
  validator.paginatedFind,
  async (req, res, _next) => {
    await controller.paginatedFind(req, res);
  },
);

router.post(
  '/user',
  validator.createUser,
  async (req, res, _next) => {
    await controller.createUser(req, res);
  },
);

router.get(
  '/user',
  validator.readUser,
  async (req, res, _next) => {
    await controller.readUser(req, res);
  },
);

router.patch(
  '/user',
  validator.updateUser,
  async (req, res, _next) => {
    await controller.updateUser(req, res);
  },
);

router.delete(
  '/user',
  validator.deleteUser,
  async (req, res, _next) => {
    await controller.deleteUser(req, res);
  },
);

export default router;
