import { validationResult } from 'express-validator';
import {
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';
import { config } from '../config/env.js';

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

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required');
    }

    await logout(refreshToken);

    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
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

export const forgotPasswordHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email } = req.body;
    const result = await forgotPassword(email);

    if (!result) {
      return sendSuccess(res, 200, 'If an account exists with this email, a password reset link has been sent.');
    }

    const frontendOrigin = (config.corsOrigin && config.corsOrigin[0]) || 'http://localhost:5173';
    const resetUrl = `${frontendOrigin}/reset-password?token=${result.resetToken}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
        text: `You requested a password reset. Visit this link to reset your password: ${resetUrl}\n\nThis link will expire in 10 minutes.`,
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
    }

    const response = {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = result.resetToken;
      response.resetUrl = resetUrl;
    }

    sendSuccess(res, 200, response.message, response);
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { token, password } = req.body;
    await resetPassword(token, password);

    sendSuccess(res, 200, 'Password reset successfully. You can now log in with your new password.');
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};
