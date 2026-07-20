import { validationResult } from 'express-validator';
import { register, login, refreshAccessToken } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password, firstName, lastName, role, phone, organization } = req.body;

    const result = await register({ email, password, firstName, lastName, role, phone, organization });

    sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    const result = await login(email, password);

    sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 401, 'Refresh token is required');
    }

    const result = await refreshAccessToken(refreshToken);

    sendSuccess(res, 200, 'Token refreshed successfully', result);
  } catch (error) {
    logger.error('Refresh token error:', error);
    sendError(res, 401, error.message);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    sendSuccess(res, 200, 'Profile fetched successfully', req.user);
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};
