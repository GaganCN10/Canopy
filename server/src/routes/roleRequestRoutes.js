import express from 'express';
import { body, query, param } from 'express-validator';
import {
  submitRequest,
  listRequests,
  getMyRequest,
  decideRequest,
  tokenDecide,
  submitProfile,
  createInviteCode,
  listInviteCodes,
  validateInviteCode,
  redeemInviteCode,
  serveDocument,
} from '../controllers/roleRequestController.js';
import { authMiddleware, roleGuard } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { strictRateLimit } from '../middlewares/rateLimit.js';
import uploadDocument from '../middlewares/uploadDocument.js';

const router = express.Router();

const REQUESTABLE_ROLES = ['researcher_ngo', 'ranger', 'rescue_center_staff'];

router.post('/', authMiddleware, strictRateLimit, uploadDocument.single('document'), validate([
  body('requestedRole').isIn(REQUESTABLE_ROLES),
  body('reason').notEmpty().withMessage('Reason is required').isLength({ max: 1000 }),
  body('orgOrDeptName').notEmpty().withMessage('Organization/Department name is required'),
  body('inviteCode').optional().isString(),
]), submitRequest);

router.get('/me', authMiddleware, getMyRequest);

router.get('/', authMiddleware, roleGuard('admin'), validate([
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('requestedRole').optional().isIn(REQUESTABLE_ROLES),
  query('userId').optional().isMongoId(),
]), listRequests);

router.patch('/:id', authMiddleware, roleGuard('admin'), validate([
  param('id').isMongoId(),
  body('action').isIn(['approve', 'reject']),
  body('reason').optional().isLength({ max: 500 }),
]), decideRequest);

router.get('/:id/decide', tokenDecide);

router.get('/:id/document', authMiddleware, serveDocument);

router.post('/role-profiles', authMiddleware, validate([
  body('role').isIn(REQUESTABLE_ROLES),
  body('fields').optional().isObject(),
]), submitProfile);

router.post('/invite-codes', authMiddleware, roleGuard('admin'), validate([
  body('expiryDays').optional().isInt({ min: 1, max: 365 }),
]), createInviteCode);

router.get('/invite-codes', authMiddleware, roleGuard('admin'), listInviteCodes);

router.get('/invite-codes/:code/validate', validateInviteCode);

router.post('/invite-codes/:code/redeem', authMiddleware, redeemInviteCode);

export default router;
