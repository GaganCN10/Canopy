import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry },
  );
  const refreshToken = jwt.sign(
    { id: userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry },
  );
  return { accessToken, refreshToken };
};

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    error.code = 'VAL_001';
    throw error;
  }
  if (!/[A-Z]/.test(password)) {
    const error = new Error('Password must contain at least one uppercase letter');
    error.statusCode = 400;
    error.code = 'VAL_001';
    throw error;
  }
  if (!/[a-z]/.test(password)) {
    const error = new Error('Password must contain at least one lowercase letter');
    error.statusCode = 400;
    error.code = 'VAL_001';
    throw error;
  }
  if (!/\d/.test(password)) {
    const error = new Error('Password must contain at least one number');
    error.statusCode = 400;
    error.code = 'VAL_001';
    throw error;
  }
};

export const register = async ({ email, password, firstName, lastName, role, phone, organization }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.code = 'AUTH_003';
    error.statusCode = 400;
    throw error;
  }

  validatePasswordStrength(password);

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: role || 'public',
    phone,
    organization,
  });

  const tokens = generateTokens(user._id);

  await user.save();

  return {
    user,
    ...tokens,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }

  if (user.isLocked()) {
    const error = new Error('Account temporarily locked due to too many failed attempts. Please try again later.');
    error.code = 'AUTH_007';
    error.statusCode = 423;
    throw error;
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
      logger.warn(`Account locked: ${email} after ${user.loginAttempts} failed attempts`);
    }
    await user.save();
    const error = new Error('Invalid credentials');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Your account has been banned');
    error.code = 'AUTH_006';
    error.statusCode = 403;
    throw error;
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const tokens = generateTokens(user._id);

  return {
    user,
    ...tokens,
  };
};

export const refreshAccessToken = (refreshToken) => {
  try {
    if (isBlacklisted(refreshToken)) {
      throw new Error('Refresh token has been revoked');
    }
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const accessToken = jwt.sign(
      { id: payload.id },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry },
    );
    return { accessToken };
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw new Error('Invalid refresh token');
  }
};

export const logout = async (refreshToken) => {
  addToBlacklist(refreshToken);
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists
    return;
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  return { user, resetToken };
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return user;
};
