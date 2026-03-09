import express from 'express';
import controller from './controller.js';

const router = express.Router();

router.get(
  '/',
  async (req, res, _next) => {
    await controller.health(req, res);
  },
);

export default router;
