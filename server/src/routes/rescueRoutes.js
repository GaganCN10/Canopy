import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createRescueCaseHandler,
  listRescueCasesHandler,
  getRescueCaseHandler,
  updateRescueCaseStatusHandler,
  addTreatmentLogHandler,
} from '../controllers/rescueController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/', authMiddleware, validate([
  body('species').isMongoId(),
  body('rescueReason').notEmpty(),
  body('center').notEmpty(),
  body('animalDetails').optional().isObject(),
  body('lat').optional().isFloat(),
  body('lng').optional().isFloat(),
]), createRescueCaseHandler);

router.get('/', authMiddleware, validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['intake', 'in_care', 'released', 'deceased']),
  query('center').optional().isString(),
]), listRescueCasesHandler);

router.get('/:id', authMiddleware, validate([
  param('id').isMongoId(),
]), getRescueCaseHandler);

router.put('/:id/status', authMiddleware, validate([
  param('id').isMongoId(),
  body('status').isIn(['intake', 'in_care', 'released', 'deceased']),
  body('releaseNotes').optional().isString(),
]), updateRescueCaseStatusHandler);

router.post('/:id/treatment', authMiddleware, validate([
  param('id').isMongoId(),
  body('notes').notEmpty(),
  body('treatment').optional().isString(),
  body('veterinarian').optional().isString(),
]), addTreatmentLogHandler);

export default router;
