import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

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

export const register = async ({ email, password, firstName, lastName, phone, organization, userAgent, ipAddress }) => {
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
    role: 'citizen',
    phone,
    organization,
  });

  const tokens = generateTokens(user._id);

  await Session.create({
    user: user._id,
    tokenHash: hashToken(tokens.accessToken),
    refreshTokenHash: hashToken(tokens.refreshToken),
    userAgent: userAgent || '',
    ipAddress: ipAddress || '',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await user.save();

  return {
    user,
    ...tokens,
  };
};

export const login = async (email, password, userAgent, ipAddress) => {
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

  await Session.create({
    user: user._id,
    tokenHash: hashToken(tokens.accessToken),
    refreshTokenHash: hashToken(tokens.refreshToken),
    userAgent: userAgent || '',
    ipAddress: ipAddress || '',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

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

export const createSession = async (userId, accessToken, refreshToken, userAgent, ipAddress) => {
  const session = await Session.create({
    user: userId,
    tokenHash: hashToken(accessToken),
    refreshTokenHash: hashToken(refreshToken),
    userAgent: userAgent || '',
    ipAddress: ipAddress || '',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return session;
};

export const getUserSessions = async (userId) => {
  return await Session.find({ user: userId, isRevoked: false }).sort({ createdAt: -1 });
};

export const revokeSession = async (userId, sessionId) => {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) {
    throw new Error('Session not found');
  }
  session.isRevoked = true;
  session.revokedAt = new Date();
  await session.save();
  return session;
};

export const revokeAllSessions = async (userId, currentSessionId) => {
  const filter = { user: userId, isRevoked: false };
  if (currentSessionId) {
    filter._id = { $ne: currentSessionId };
  }
  return await Session.updateMany(filter, { isRevoked: true, revokedAt: new Date() });
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

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw new Error('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }

  validatePasswordStrength(newPassword);

  user.password = newPassword;
  await user.save();

  return user;
};
