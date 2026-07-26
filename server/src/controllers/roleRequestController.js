import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import {
  createRoleRequest,
  getRoleRequests,
  getMyRoleRequests,
  decideRoleRequest,
  submitRoleProfile,
  generateInviteCode,
  getInviteCodes,
  useInviteCode,
} from '../services/roleRequestService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';
import { config } from '../config/env.js';
import User from '../models/User.js';
import RoleRequest from '../models/RoleRequest.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const serveDocument = async (req, res, next) => {
  try {
    const roleRequest = await RoleRequest.findById(req.params.id);
    if (!roleRequest) {
      return sendError(res, 404, 'Role request not found');
    }

    if (!roleRequest.documentFile) {
      return sendError(res, 404, 'No document found for this request');
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && roleRequest.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return sendError(res, 403, 'You do not have permission to access this document');
    }

    const filePath = path.join(__dirname, '../../uploads/documents/', path.basename(roleRequest.documentFile));
    res.sendFile(filePath);
  } catch (error) {
    logger.error('Serve document error:', error);
    next(error);
  }
};

export const submitRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const documentFile = req.file;
    const roleRequest = await createRoleRequest(req.user._id, req.body, documentFile);
    sendSuccess(res, 201, 'Role request submitted successfully', roleRequest);
  } catch (error) {
    logger.error('Create role request error:', error);
    next(error);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      requestedRole: req.query.requestedRole,
      userId: req.query.userId,
    };
    const requests = await getRoleRequests(filters);
    sendSuccess(res, 200, 'Role requests fetched successfully', requests);
  } catch (error) {
    logger.error('List role requests error:', error);
    next(error);
  }
};

export const getMyRequest = async (req, res, next) => {
  try {
    const requests = await getMyRoleRequests(req.user._id);
    sendSuccess(res, 200, 'Your role requests fetched successfully', requests);
  } catch (error) {
    logger.error('Get my role requests error:', error);
    next(error);
  }
};

export const decideRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { action, reason } = req.body;
    const roleRequest = await decideRoleRequest(req.params.id, action, req.user._id, reason);
    sendSuccess(res, 200, `Role request ${action}d successfully`, roleRequest);
  } catch (error) {
    logger.error('Decide role request error:', error);
    next(error);
  }
};

export const tokenDecide = async (req, res, next) => {
  try {
    const { token, action } = req.query;

    if (!token || !action) {
      return sendError(res, 400, 'Token and action are required');
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const requestId = decoded.requestId;

    const roleRequest = await RoleRequest.findById(requestId);
    if (!roleRequest) {
      return sendError(res, 404, 'Role request not found');
    }

    if (roleRequest.decisionTokenExpiresAt < new Date()) {
      return sendError(res, 400, 'Decision token has expired');
    }

    const tokenHash = hashToken(token);
    if (roleRequest.decisionToken !== tokenHash) {
      return sendError(res, 400, 'Invalid decision token');
    }

    if (roleRequest.status !== 'pending') {
      return sendError(res, 400, 'This request has already been decided');
    }

    const adminUser = await User.findOne({ email: decoded.adminEmail });
    if (!adminUser) {
      return sendError(res, 404, 'Admin user not found');
    }

    const decidedRequest = await decideRoleRequest(requestId, action, adminUser._id);
    sendSuccess(res, 200, `Role request ${action}d successfully via token`, decidedRequest);
  } catch (error) {
    logger.error('Token decide error:', error);
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 400, 'Invalid or expired token');
    }
    next(error);
  }
};

export const submitProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const user = await submitRoleProfile(req.user._id, req.body);
    sendSuccess(res, 200, 'Role profile submitted successfully', user);
  } catch (error) {
    logger.error('Submit role profile error:', error);
    next(error);
  }
};

export const createInviteCode = async (req, res, next) => {
  try {
    const { expiryDays } = req.body;
    const inviteCode = await generateInviteCode(req.user._id, expiryDays || 30);
    sendSuccess(res, 201, 'Invite code created successfully', inviteCode);
  } catch (error) {
    logger.error('Create invite code error:', error);
    next(error);
  }
};

export const listInviteCodes = async (req, res, next) => {
  try {
    const codes = await getInviteCodes();
    sendSuccess(res, 200, 'Invite codes fetched successfully', codes);
  } catch (error) {
    logger.error('List invite codes error:', error);
    next(error);
  }
};

export const validateInviteCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const inviteCode = await InviteCode.findOne({
      code: code.toUpperCase(),
      usedBy: null,
      expiresAt: { $gt: new Date() },
    });

    if (!inviteCode) {
      return sendError(res, 404, 'Invalid or expired invite code');
    }

    sendSuccess(res, 200, 'Invite code is valid', { role: inviteCode.role });
  } catch (error) {
    logger.error('Validate invite code error:', error);
    next(error);
  }
};

export const redeemInviteCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const inviteCode = await useInviteCode(req.user._id, code);
    sendSuccess(res, 200, 'Invite code redeemed successfully', inviteCode);
  } catch (error) {
    logger.error('Redeem invite code error:', error);
    next(error);
  }
};
