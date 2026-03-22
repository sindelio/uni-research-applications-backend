import express from 'express';
import identityVerifier from '../../middlewares/auth/identity-verifier.mid.js';
import controller from './controller.js';
import validator from './middlewares/validator.mid.js';

const router = express.Router();

router.post(
  '/confirm-email',
  validator.confirmEmail,
  async (req, res, _next) => {
    await controller.confirmEmail(req, res);
  },
);

router.post(
  '/recover-password',
  validator.recoverPassword,
  async (req, res, _next) => {
    await controller.recoverPassword(req, res);
  },
);

router.post(
  '/reset-password',
  validator.resetPassword,
  async (req, res, _next) => {
    await controller.resetPassword(req, res);
  },
);

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

router.delete(
  '/',
  async (req, res, _next) => {
    await controller.delete(req, res);
  },
);

router.post(
  '/stats',
  validator.stats,
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
  '/project',
  validator.createProject,
  async (req, res, _next) => {
    await controller.createProject(req, res);
  },
);

router.get(
  '/project',
  validator.readProject,
  async (req, res, _next) => {
    await controller.readProject(req, res);
  },
);

router.patch(
  '/project',
  validator.updateProject,
  async (req, res, _next) => {
    await controller.updateProject(req, res);
  },
);

router.delete(
  '/project',
  validator.deleteProject,
  async (req, res, _next) => {
    await controller.deleteProject(req, res);
  },
);

export default router;
