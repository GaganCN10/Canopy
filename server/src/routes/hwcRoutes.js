import express from 'express';
import { body, query } from 'express-validator';
import {
  createHWCIncidentHandler,
  listHWCIncidentsHandler,
  listGeofenceZonesHandler,
  createGeofenceZoneHandler,
} from '../controllers/hwcController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/incidents', authMiddleware, validate([
  body('type').isIn(['crop_raiding', 'livestock_predation', 'property_damage', 'injury', 'fatal', 'other']),
  body('description').notEmpty(),
  body('lat').isFloat(),
  body('lng').isFloat(),
  body('lossDescription').optional().isString(),
]), createHWCIncidentHandler);

router.get('/incidents', authMiddleware, validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['crop_raiding', 'livestock_predation', 'property_damage', 'injury', 'fatal', 'other']),
]), listHWCIncidentsHandler);

router.get('/zones', authMiddleware, listGeofenceZonesHandler);

router.post('/zones', authMiddleware, roleGuard('admin'), validate([
  body('name').notEmpty(),
  body('description').optional().isString(),
  body('coordinates').isArray().isLength({ min: 4 }),
]), createGeofenceZoneHandler);

export default router;
