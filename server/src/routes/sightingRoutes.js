import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createSightingHandler,
  listSightingsHandler,
  getSightingHandler,
  voteSightingHandler,
} from '../controllers/sightingController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/', authMiddleware, validate([
  body('species').isMongoId().withMessage('Valid species ID is required'),
  body('lat').isFloat().withMessage('Valid latitude is required'),
  body('lng').isFloat().withMessage('Valid longitude is required'),
  body('notes').optional().isString(),
  body('images').optional().isArray(),
]), createSightingHandler);

router.get('/', validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('species').optional({ nullable: true }).isMongoId(),
  query('status').optional({ nullable: true }).isIn(['pending', 'verified', 'rejected']),
  query('startDate').optional({ nullable: true }).isISO8601(),
  query('endDate').optional({ nullable: true }).isISO8601(),
  query('bbox').optional({ nullable: true }).isString(),
]), listSightingsHandler);

router.get('/:id', validate([
  param('id').isMongoId(),
]), getSightingHandler);

router.post('/:id/vote', authMiddleware, validate([
  param('id').isMongoId(),
  body('vote').isIn(['upvote', 'downvote']).withMessage('Vote must be upvote or downvote'),
]), voteSightingHandler);

export default router;
