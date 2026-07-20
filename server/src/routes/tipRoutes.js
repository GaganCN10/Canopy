import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createTipHandler,
  listTipsHandler,
  getTipHandler,
  updateTipStatusHandler,
} from '../controllers/tipController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { strictRateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/', strictRateLimit, validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('lat').optional().isFloat(),
  body('lng').optional().isFloat(),
  body('submitterEmail').optional().isEmail(),
  body('submitterPhone').optional().isString(),
  body('isAnonymous').optional().isBoolean(),
]), createTipHandler);

router.get('/', authMiddleware, roleGuard('ranger', 'admin'), validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'under_review', 'actioned', 'closed']),
]), listTipsHandler);

router.get('/:id', authMiddleware, roleGuard('ranger', 'admin'), validate([
  param('id').isMongoId(),
]), getTipHandler);

router.put('/:id/status', authMiddleware, roleGuard('ranger', 'admin'), validate([
  param('id').isMongoId(),
  body('status').isIn(['new', 'under_review', 'actioned', 'closed']),
  body('reviewNotes').optional().isString(),
]), updateTipStatusHandler);

export default router;
