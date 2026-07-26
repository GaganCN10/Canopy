import { validationResult } from 'express-validator';
import {
  getUserSessions,
  revokeSession,
  revokeAllSessions,
} from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const listSessions = async (req, res, next) => {
  try {
    const sessions = await getUserSessions(req.user._id);
    sendSuccess(res, 200, 'Sessions fetched successfully', sessions);
  } catch (error) {
    logger.error('List sessions error:', error);
    next(error);
  }
};

export const revokeUserSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const session = await revokeSession(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Session revoked successfully', session);
  } catch (error) {
    logger.error('Revoke session error:', error);
    next(error);
  }
};

export const revokeAllUserSessions = async (req, res, next) => {
  try {
    const currentSessionId = req.session?._id;
    const result = await revokeAllSessions(req.user._id, currentSessionId);
    sendSuccess(res, 200, 'All other sessions revoked successfully', { revokedCount: result.modifiedCount });
  } catch (error) {
    logger.error('Revoke all sessions error:', error);
    next(error);
  }
};
