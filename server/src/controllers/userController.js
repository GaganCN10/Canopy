import { validationResult } from 'express-validator';
import {
  updateProfile,
  getAllUsers,
  updateUserRole,
  toggleBanUser,
} from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const user = await updateProfile(req.user._id, req.body);
    sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await getAllUsers({ page: parseInt(page, 10), limit: parseInt(limit, 10), search });
    sendSuccess(res, 200, 'Users fetched successfully', result);
  } catch (error) {
    logger.error('List users error:', error);
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await updateUserRole(req.params.id, role);
    sendSuccess(res, 200, 'User role updated successfully', user);
  } catch (error) {
    logger.error('Change user role error:', error);
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const user = await toggleBanUser(req.params.id);
    sendSuccess(res, 200, `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user);
  } catch (error) {
    logger.error('Ban user error:', error);
    next(error);
  }
};
