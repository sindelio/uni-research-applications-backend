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

router.delete(
  '/',
  async (req, res, _next) => {
    await controller.delete(req, res);
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
  '/admin',
  validator.createUser,
  async (req, res, _next) => {
    await controller.createAdmin(req, res);
  },
);

router.get(
  '/admin',
  validator.readUser,
  async (req, res, _next) => {
    await controller.readAdmin(req, res);
  },
);

router.patch(
  '/admin',
  validator.updateAdmin,
  async (req, res, _next) => {
    await controller.updateAdmin(req, res);
  },
);

router.delete(
  '/admin',
  validator.deleteUser,
  async (req, res, _next) => {
    await controller.deleteAdmin(req, res);
  },
);

router.get(
  '/examiner',
  validator.readUser,
  async (req, res, _next) => {
    await controller.readExaminer(req, res);
  },
);

router.patch(
  '/examiner',
  validator.updateExaminer,
  async (req, res, _next) => {
    await controller.updateExaminer(req, res);
  },
);

router.delete(
  '/examiner',
  validator.deleteUser,
  async (req, res, _next) => {
    await controller.deleteExaminer(req, res);
  },
);

router.get(
  '/participant',
  validator.readUser,
  async (req, res, _next) => {
    await controller.readParticipant(req, res);
  },
);

router.patch(
  '/participant',
  validator.updateParticipant,
  async (req, res, _next) => {
    await controller.updateParticipant(req, res);
  },
);

router.delete(
  '/participant',
  validator.deleteUser,
  async (req, res, _next) => {
    await controller.deleteParticipant(req, res);
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

router.post(
  '/settings',
  async (req, res, _next) => {
    await controller.createSettings(req, res);
  },
);

router.get(
  '/settings',
  async (req, res, _next) => {
    await controller.readSettings(req, res);
  },
);

router.patch(
  '/settings',
  async (req, res, _next) => {
    await controller.updateSettings(req, res);
  },
);

router.delete(
  '/settings',
  async (req, res, _next) => {
    await controller.deleteSettings(req, res);
  },
);

export default router;
