import express from 'express';
import { body, query } from 'express-validator';
import { predictSpeciesImageHandler, triageCameraTrapHandler, predictBioacousticHandler, predictThreatAudioHandler } from '../controllers/mlController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/species-predict', authMiddleware, upload.single('image'), validate([
  body('image').optional().isString(),
]), predictSpeciesImageHandler);

router.post('/camera-trap', authMiddleware, upload.single('image'), validate([
  body('image').optional().isString(),
]), triageCameraTrapHandler);

router.post('/bioacoustic', authMiddleware, upload.single('audio'), validate([
  body('audio').optional().isString(),
]), predictBioacousticHandler);

router.post('/threat-audio', authMiddleware, upload.single('audio'), validate([
  body('audio').optional().isString(),
]), predictThreatAudioHandler);

export default router;
