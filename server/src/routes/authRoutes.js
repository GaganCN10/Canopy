import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  refreshToken,
  getProfile,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/register', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
]), registerUser);

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), loginUser);

router.post('/refresh', validate([
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
]), refreshToken);

router.get('/me', authMiddleware, getProfile);

export default router;
