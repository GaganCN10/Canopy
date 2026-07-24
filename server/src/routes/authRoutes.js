import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getProfile,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { strictRateLimit, rateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/register', strictRateLimit, validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
]), registerUser);

router.post('/login', strictRateLimit, validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), loginUser);

router.post('/refresh', rateLimit(15 * 60 * 1000, 20), validate([
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
]), refreshToken);

router.post('/logout', authMiddleware, validate([
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
]), logoutUser);

router.get('/me', authMiddleware, getProfile);

export default router;
