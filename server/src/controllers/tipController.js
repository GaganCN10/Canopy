import { validationResult } from 'express-validator';
import {
  createTip,
  getTips,
  getTipById,
  updateTipStatus,
} from '../services/tipService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notificationService.js';
import logger from '../utils/logger.js';

export const createTipHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { title, description, lat, lng, submitterEmail, submitterPhone, isAnonymous } = req.body;

    const tipData = {
      title,
      description,
      isAnonymous: isAnonymous !== 'false',
      submitterEmail: isAnonymous === 'true' ? null : submitterEmail,
      submitterPhone: isAnonymous === 'true' ? null : submitterPhone,
    };

    if (lat && lng) {
      tipData.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    if (!isAnonymous || isAnonymous === 'false') {
      tipData.submittedBy = req.user?._id;
    }

    const tip = await createTip(tipData);
    sendSuccess(res, 201, 'Tip submitted successfully', tip);
  } catch (error) {
    logger.error('Create tip error:', error);
    next(error);
  }
};

export const listTipsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await getTips({ page: parseInt(page, 10), limit: parseInt(limit, 10), status });
    sendSuccess(res, 200, 'Tips fetched successfully', result);
  } catch (error) {
    logger.error('List tips error:', error);
    next(error);
  }
};

export const getTipHandler = async (req, res, next) => {
  try {
    const tip = await getTipById(req.params.id);
    sendSuccess(res, 200, 'Tip fetched successfully', tip);
  } catch (error) {
    logger.error('Get tip error:', error);
    next(error);
  }
};

export const updateTipStatusHandler = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const tip = await updateTipStatus(req.params.id, req.user._id, status, reviewNotes, req.user.role);

    if (tip.submittedBy) {
      await createNotification({
        recipient: tip.submittedBy.toString(),
        type: 'tip_status_change',
        title: `Tip ${status.replace('_', ' ')}`,
        message: `Your anti-poaching tip has been updated to: ${status}. ${reviewNotes ? 'Notes: ' + reviewNotes : ''}`,
        data: { tipId: tip._id, status },
        channels: { inApp: true, email: true },
      });
    }

    sendSuccess(res, 200, 'Tip status updated successfully', tip);
  } catch (error) {
    logger.error('Update tip status error:', error);
    next(error);
  }
};
