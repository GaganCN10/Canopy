import express from 'express';
import { query } from 'express-validator';
import {
  getSightingsOverTimeHandler,
  getSpeciesDistributionHandler,
  getRegionalActivityHandler,
  getVerificationStatsHandler,
  getDashboardSummaryHandler,
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.get('/summary', authMiddleware, getDashboardSummaryHandler);

router.get('/sightings-over-time', authMiddleware, validate([
  query('days').optional().isInt({ min: 1, max: 365 }),
]), getSightingsOverTimeHandler);

router.get('/species-distribution', authMiddleware, getSpeciesDistributionHandler);

router.get('/regional-activity', authMiddleware, getRegionalActivityHandler);

router.get('/verification-stats', authMiddleware, getVerificationStatsHandler);

export default router;
