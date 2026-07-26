import express from 'express';
import { body, query, param } from 'express-validator';
import {
  listArticles,
  getArticle,
  create,
  update,
  remove,
  attachQuiz,
  getQuiz,
  patchQuiz,
  attemptQuiz,
  listQuizAttempts,
} from '../controllers/articleController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { strictRateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

const ARTICLE_TOPICS = ['species-id', 'habitats', 'coexistence', 'anti-poaching', 'citizen-science', 'ecosystems', 'other'];

router.get('/', validate([
  query('topic').optional().isIn(ARTICLE_TOPICS),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'most-read']),
]), listArticles);

router.get('/:slug', validate([
  param('slug').isString(),
]), getArticle);

router.post('/', authMiddleware, roleGuard('researcher', 'ranger', 'admin'), strictRateLimit, validate([
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('body').notEmpty().withMessage('Body is required'),
  body('topic').isIn(ARTICLE_TOPICS),
  body('status').optional().isIn(['draft', 'published']),
  body('slug').optional().isString(),
]), create);

router.patch('/:id', authMiddleware, validate([
  param('id').isMongoId(),
  body('title').optional().isLength({ max: 200 }),
  body('body').optional(),
  body('topic').optional().isIn(ARTICLE_TOPICS),
  body('status').optional().isIn(['draft', 'published']),
  body('slug').optional().isString(),
]), update);

router.delete('/:id', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
]), remove);

router.post('/:id/quiz', authMiddleware, validate([
  param('id').isMongoId(),
  body('passThresholdPercent').optional().isInt({ min: 0, max: 100 }),
  body('retakePolicy').optional().isIn(['unlimited', 'single-attempt']),
  body('questions').optional().isArray(),
]), attachQuiz);

router.get('/:id/quiz', validate([
  param('id').isMongoId(),
]), getQuiz);

router.patch('/quizzes/:id', authMiddleware, validate([
  param('id').isMongoId(),
  body('passThresholdPercent').optional().isInt({ min: 0, max: 100 }),
  body('retakePolicy').optional().isIn(['unlimited', 'single-attempt']),
]), patchQuiz);

router.post('/quizzes/:id/attempts', authMiddleware, validate([
  param('id').isMongoId(),
  body('answers').isArray().withMessage('Answers array is required'),
]), attemptQuiz);

router.get('/users/me/quiz-attempts', authMiddleware, listQuizAttempts);

export default router;
