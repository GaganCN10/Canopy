import express from 'express';
import { body, param, query } from 'express-validator';
import {
  updateUserProfile,
  listUsers,
  changeUserRole,
  banUser,
} from '../controllers/userController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.put('/me', authMiddleware, validate([
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('phone').optional().notEmpty(),
  body('organization').optional().notEmpty(),
]), updateUserProfile);

router.get('/', authMiddleware, roleGuard('admin'), validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
]), listUsers);

router.put('/:id/role', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
  body('role').isIn(['public', 'citizen', 'ranger', 'researcher', 'rescue', 'admin']),
]), changeUserRole);

router.put('/:id/ban', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
]), banUser);

export default router;
