import express from 'express';
import identityVerifier from '../../middlewares/auth/identity-verifier.mid.js';
import controller from './controller.js';
import validator from './middlewares/validator.mid.js';
import githubRouter from './data-source/github/router.js';
import linkedinRouter from './data-source/linkedin/router.js';
import dribbbleRouter from './data-source/dribbble/router.js';
import resumeRouter from './data-source/resume/router.js';

const router = express.Router();

router.post(
  '/',
  validator.create,
  async (req, res, _next) => {
    await controller.create(req, res);
  },
);

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
  '/paginated-find',
  validator.paginatedFind,
  async (req, res, _next) => {
    await controller.paginatedFind(req, res);
  },
);

router.get(
  '/request',
  validator.readRequest,
  async (req, res, _next) => {
    await controller.readRequest(req, res);
  },
);

router.post(
  '/invoice/pay',
  validator.payInvoice,
  async (req, res, _next) => {
    await controller.payInvoice(req, res);
  },
);

router.get(
  '/invoice',
  validator.readInvoice,
  async (req, res, _next) => {
    await controller.readInvoice(req, res);
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
  '/regenerate-api-key',
  async (req, res, _next) => {
    await controller.regenerateApiKey(req, res);
  },
);

router.post(
  '/support',
  validator.requestSupport,
  async (req, res, _next) => {
    await controller.requestSupport(req, res);
  },
);

router.use(linkedinRouter);
router.use(githubRouter);
router.use(dribbbleRouter);
router.use(resumeRouter);

export default router;
