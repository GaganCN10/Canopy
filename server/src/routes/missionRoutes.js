import express from 'express';
import { body, query, param } from 'express-validator';
import {
  listMissions,
  getMission,
  create,
  update,
  join,
  approveJoin,
  deleteMember,
  addCoLead,
  listThread,
  createPost,
  listTasks,
  createTask,
  updateTask,
  changeStatus,
  myMissions,
} from '../controllers/missionController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { missionRoleGuard, isMissionMember } from '../middlewares/missionRoleGuard.js';
import { validate } from '../middlewares/validate.js';
import { strictRateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

const MISSION_TOPICS = ['cleanup', 'monitoring', 'awareness_education', 'data_tagging', 'rescue_support', 'advocacy', 'other'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const STATUSES = ['planning', 'active', 'completed', 'archived', 'cancelled'];

router.get('/', validate([
  query('topic').optional().isString().trim().custom((val) => !val || MISSION_TOPICS.includes(val)),
  query('locationType').optional().isString().trim().custom((val) => !val || LOCATION_TYPES.includes(val)),
  query('status').optional().isString().trim().custom((val) => !val || STATUSES.includes(val)),
  query('remoteOnly').optional().isString().custom((val) => !val || ['true', 'false'].includes(val)),
  query('nearLng').optional().isFloat({ min: -180, max: 180 }),
  query('nearLat').optional().isFloat({ min: -90, max: 90 }),
  query('nearRadius').optional().isInt({ min: 0 }),
]), listMissions);

router.get('/my', authMiddleware, myMissions);

router.get('/:id', validate([
  param('id').isMongoId(),
]), getMission);

router.post('/', authMiddleware, roleGuard('citizen', 'ranger', 'researcher', 'rescue', 'admin'), strictRateLimit, validate([
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').notEmpty().withMessage('Description is required'),
  body('topic').isIn(MISSION_TOPICS),
  body('locationType').isIn(LOCATION_TYPES),
  body('joinType').optional().isIn(['open', 'request']),
  body('memberCap').optional().isInt({ min: 1 }),
  body('targetDate').optional().isISO8601(),
  body('location').optional().isObject(),
  body('address').optional().isString(),
]), create);

router.patch('/:id', authMiddleware, missionRoleGuard('lead', 'co-lead'), validate([
  param('id').isMongoId(),
  body('title').optional().isLength({ max: 200 }),
  body('description').optional(),
  body('topic').optional().isIn(MISSION_TOPICS),
  body('locationType').optional().isIn(LOCATION_TYPES),
  body('joinType').optional().isIn(['open', 'request']),
  body('memberCap').optional().isInt({ min: 1 }),
  body('targetDate').optional().isISO8601(),
  body('status').optional().isIn(STATUSES),
]), update);

router.post('/:id/join', authMiddleware, roleGuard('citizen', 'ranger', 'researcher', 'rescue', 'admin'), validate([
  param('id').isMongoId(),
  body('message').optional().isString(),
]), join);

router.post('/:id/join-requests/:userId/approve', authMiddleware, missionRoleGuard('lead', 'co-lead'), validate([
  param('id').isMongoId(),
  param('userId').isMongoId(),
]), approveJoin);

router.delete('/:id/members/:userId', authMiddleware, missionRoleGuard('lead', 'co-lead'), validate([
  param('id').isMongoId(),
  param('userId').isMongoId(),
]), deleteMember);

router.post('/:id/co-leads/:userId', authMiddleware, missionRoleGuard('lead'), validate([
  param('id').isMongoId(),
  param('userId').isMongoId(),
]), addCoLead);

router.get('/:id/thread', authMiddleware, isMissionMember, validate([
  param('id').isMongoId(),
]), listThread);

router.post('/:id/thread', authMiddleware, isMissionMember, strictRateLimit, validate([
  param('id').isMongoId(),
  body('type').optional().isIn(['post', 'update']),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 2000 }),
  body('attachments').optional().isArray(),
  body('parentPost').optional().isMongoId(),
]), createPost);

router.get('/:id/tasks', authMiddleware, isMissionMember, validate([
  param('id').isMongoId(),
]), listTasks);

router.post('/:id/tasks', authMiddleware, isMissionMember, validate([
  param('id').isMongoId(),
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('assignedTo').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
]), createTask);

router.patch('/:id/tasks/:taskId', authMiddleware, isMissionMember, validate([
  param('id').isMongoId(),
  param('taskId').isMongoId(),
  body('status').optional().isIn(['open', 'in_progress', 'done']),
  body('assignedTo').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
  body('title').optional().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
]), updateTask);

router.patch('/:id/status', authMiddleware, missionRoleGuard('lead', 'co-lead'), validate([
  param('id').isMongoId(),
  body('status').isIn(STATUSES),
]), changeStatus);

router.get('/my', authMiddleware, myMissions);

export default router;
