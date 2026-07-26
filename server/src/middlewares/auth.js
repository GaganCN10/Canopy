import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const refreshTokenBlacklist = new Set();

export const addToBlacklist = (token) => {
  refreshTokenBlacklist.add(token);
};

export const isBlacklisted = (token) => {
  return refreshTokenBlacklist.has(token);
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned',
        code: 'AUTH_006',
      });
    }

    const tokenHash = hashToken(token);
    const session = await Session.findOne({ tokenHash, isRevoked: false });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    session.lastActivityAt = new Date();
    await session.save();

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};
