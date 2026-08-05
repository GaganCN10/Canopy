import express from 'express';
import { body, query } from 'express-validator';
import { predictSpeciesImageHandler, triageCameraTrapHandler, predictBioacousticHandler, predictThreatAudioHandler, getHabitatNDVIHandler, predictPoachingHotspotsHandler, predictPopulationForecastHandler, detectAnomaliesHandler, predictMovementCorridorsHandler } from '../controllers/mlController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { mlUpload } from '../middlewares/mlUpload.js';

const router = express.Router();

router.post('/species-predict', authMiddleware, mlUpload.single('image'), validate([
  body('image').optional().isString(),
]), predictSpeciesImageHandler);

router.post('/camera-trap', authMiddleware, mlUpload.single('image'), validate([
  body('image').optional().isString(),
]), triageCameraTrapHandler);

router.post('/bioacoustic', authMiddleware, mlUpload.single('audio'), validate([
  body('audio').optional().isString(),
]), predictBioacousticHandler);

router.post('/threat-audio', authMiddleware, mlUpload.single('audio'), validate([
  body('audio').optional().isString(),
]), predictThreatAudioHandler);

router.post('/habitat-ndvi', authMiddleware, validate([
  body('bbox').isArray({ min: 4, max: 4 }),
  body('start_date').isString(),
  body('end_date').isString(),
  body('max_cloud_cover').optional().isInt({ min: 0, max: 100 }),
]), getHabitatNDVIHandler);

router.post('/poaching-hotspots', authMiddleware, roleGuard('ranger', 'admin', 'researcher'), validate([
  body('points').optional().isArray({ max: 10000 }),
  body('bandwidth').optional().isFloat({ min: 0.01, max: 10 }),
  body('grid_size').optional().isInt({ min: 10, max: 200 }),
]), predictPoachingHotspotsHandler);

router.post('/population-forecast', authMiddleware, validate([
  body('speciesId').notEmpty(),
  body('start_date').optional().isString(),
  body('end_date').optional().isString(),
  body('periods').optional().isInt({ min: 1, max: 365 }),
]), predictPopulationForecastHandler);

router.post('/anomalies', authMiddleware, roleGuard('admin', 'researcher'), validate([
  body('speciesId').optional().notEmpty(),
  body('bbox').optional().isArray({ min: 4, max: 4 }),
  body('start_date').optional().isString(),
  body('end_date').optional().isString(),
  body('window').optional().isInt({ min: 2, max: 90 }),
  body('threshold').optional().isFloat({ min: 0.1, max: 10 }),
]), detectAnomaliesHandler);

router.post('/movement-corridors', authMiddleware, mlUpload.single('file'), validate([
  body('file').optional().isString(),
  body('movebank_study_id').optional().isString(),
]), predictMovementCorridorsHandler);

export default router;
