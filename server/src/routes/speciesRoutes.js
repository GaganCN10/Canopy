import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createSpeciesHandler,
  listSpeciesHandler,
  getSpeciesHandler,
  updateSpeciesHandler,
  deleteSpeciesHandler,
} from '../controllers/speciesController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.get('/', validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
]), listSpeciesHandler);

router.get('/:id', validate([
  param('id').isMongoId(),
]), getSpeciesHandler);

router.post('/', authMiddleware, roleGuard('admin'), validate([
  body('name').notEmpty().withMessage('Species name is required'),
  body('scientificName').optional().isString(),
  body('conservationStatus').optional().isIn(['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD', 'NE']),
  body('description').optional().isString(),
  body('region').optional().isArray(),
  body('images').optional().isArray(),
]), createSpeciesHandler);

router.put('/:id', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
  body('name').optional().notEmpty().withMessage('Species name cannot be empty'),
  body('scientificName').optional().isString(),
  body('conservationStatus').optional().isIn(['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD', 'NE']),
  body('description').optional().isString(),
  body('region').optional().isArray(),
  body('images').optional().isArray(),
]), updateSpeciesHandler);

router.delete('/:id', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
]), deleteSpeciesHandler);

export default router;
