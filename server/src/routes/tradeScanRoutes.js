import express from 'express';
import { body, query } from 'express-validator';
import { scanTradeTextHandler, getTradeFlagsHandler, getTradeFlagByIdHandler, updateTradeFlagStatusHandler } from '../controllers/tradeScanController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/scan', authMiddleware, validate([
  body('text').notEmpty(),
  body('source').optional().isString(),
]), scanTradeTextHandler);

router.get('/flags', authMiddleware, roleGuard('admin'), validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
]), getTradeFlagsHandler);

router.get('/flags/:id', authMiddleware, roleGuard('admin'), getTradeFlagByIdHandler);

router.patch('/flags/:id', authMiddleware, roleGuard('admin'), validate([
  body('status').isIn(['approved', 'dismissed']),
  body('reviewNotes').optional().isString(),
]), updateTradeFlagStatusHandler);

export default router;
