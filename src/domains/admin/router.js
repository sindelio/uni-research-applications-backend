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

router.get(
  '/request',
  validator.readRequest,
  async (req, res, _next) => {
    await controller.readRequest(req, res);
  },
);

router.delete(
  '/request',
  validator.deleteRequest,
  async (req, res, _next) => {
    await controller.deleteRequest(req, res);
  },
);

router.post(
  '/invoice',
  validator.createInvoice,
  async (req, res, _next) => {
    await controller.createInvoice(req, res);
  },
);

router.post(
  '/invoices',
  validator.createInvoices,
  async (req, res, _next) => {
    await controller.createInvoices(req, res);
  },
);

router.post(
  '/invoice/mark-as-paid',
  validator.markInvoiceAsPaid,
  async (req, res, _next) => {
    await controller.markInvoiceAsPaid(req, res);
  },
);

router.get(
  '/invoice',
  validator.readInvoice,
  async (req, res, _next) => {
    await controller.readInvoice(req, res);
  },
);

router.delete(
  '/invoice',
  validator.deleteInvoice,
  async (req, res, _next) => {
    await controller.deleteInvoice(req, res);
  },
);

router.post(
  '/account/linkedin',
  validator.createLinkedinAccount,
  async (req, res, _next) => {
    await controller.createLinkedinAccount(req, res);
  },
);

router.get(
  '/account/linkedin',
  validator.readLinkedinAccount,
  async (req, res, _next) => {
    await controller.readLinkedinAccount(req, res);
  },
);

router.patch(
  '/account/linkedin',
  validator.updateLinkedinAccount,
  async (req, res, _next) => {
    await controller.updateLinkedinAccount(req, res);
  },
);

router.delete(
  '/account/linkedin',
  validator.deleteLinkedinAccount,
  async (req, res, _next) => {
    await controller.deleteLinkedinAccount(req, res);
  },
);

router.post(
  '/account/linkedin/test',
  validator.testLinkedinAccount,
  async (req, res, _next) => {
    await controller.testLinkedinAccount(req, res);
  },
);

router.post(
  '/account/linkedin/test-all',
  async (req, res, _next) => {
    await controller.testAllLinkedinAccounts(req, res);
  },
);

router.post(
  '/account/linkedin/save-all-cookies',
  async (req, res, _next) => {
    await controller.saveAllLinkedinAccountsCookies(req, res);
  },
);

router.post(
  '/newsletter',
  async (req, res, _next) => {
    await controller.createNewsletter(req, res);
  },
);

export default router;
