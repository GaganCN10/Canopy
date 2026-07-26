import express from 'express';
import { param } from 'express-validator';
import {
  listSessions,
  revokeUserSession,
  revokeAllUserSessions,
} from '../controllers/sessionController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.get('/', authMiddleware, listSessions);

router.delete('/:id', authMiddleware, validate([
  param('id').isMongoId(),
]), revokeUserSession);

router.delete('/', authMiddleware, revokeAllUserSessions);

export default router;
