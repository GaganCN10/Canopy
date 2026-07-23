import { validationResult } from 'express-validator';
import {
  createRescueCase,
  getRescueCases,
  getRescueCaseById,
  updateRescueCaseStatus,
  addTreatmentLog,
} from '../services/rescueService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notificationService.js';
import logger from '../utils/logger.js';

export const createRescueCaseHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { species, animalDetails, rescueReason, center, lat, lng } = req.body;

    const rescueCase = await createRescueCase({
      species,
      animalDetails,
      rescueReason,
      rescuer: req.user._id,
      center,
      caseNumber: `RC-${Date.now()}`,
      rescueLocation: lat && lng ? { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } : undefined,
      status: 'intake',
    });

    await createNotification({
      recipient: req.user._id.toString(),
      type: 'rescue_update',
      title: 'Rescue Case Created',
      message: `Rescue case ${rescueCase.caseNumber} has been created for ${rescueCase.species?.name || 'unknown species'}.`,
      data: { rescueCaseId: rescueCase._id, caseNumber: rescueCase.caseNumber },
      channels: { inApp: true },
    });

    sendSuccess(res, 201, 'Rescue case created successfully', rescueCase);
  } catch (error) {
    logger.error('Create rescue case error:', error);
    next(error);
  }
};

export const listRescueCasesHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, center } = req.query;
    const result = await getRescueCases({ page: parseInt(page, 10), limit: parseInt(limit, 10), status, center });
    sendSuccess(res, 200, 'Rescue cases fetched successfully', result);
  } catch (error) {
    logger.error('List rescue cases error:', error);
    next(error);
  }
};

export const getRescueCaseHandler = async (req, res, next) => {
  try {
    const rescueCase = await getRescueCaseById(req.params.id);
    sendSuccess(res, 200, 'Rescue case fetched successfully', rescueCase);
  } catch (error) {
    logger.error('Get rescue case error:', error);
    next(error);
  }
};

export const updateRescueCaseStatusHandler = async (req, res, next) => {
  try {
    const { status, releaseNotes } = req.body;
    const rescueCase = await updateRescueCaseStatus(req.params.id, status, releaseNotes);

    await createNotification({
      recipient: rescueCase.rescuer.toString(),
      type: 'rescue_update',
      title: `Rescue Case ${status.replace('_', ' ')}`,
      message: `Rescue case ${rescueCase.caseNumber} status updated to ${status}.${releaseNotes ? ' Notes: ' + releaseNotes : ''}`,
      data: { rescueCaseId: rescueCase._id, caseNumber: rescueCase.caseNumber, status },
      channels: { inApp: true, email: true },
    });

    sendSuccess(res, 200, 'Rescue case status updated successfully', rescueCase);
  } catch (error) {
    logger.error('Update rescue case status error:', error);
    next(error);
  }
};

export const addTreatmentLogHandler = async (req, res, next) => {
  try {
    const rescueCase = await addTreatmentLog(req.params.id, req.body);
    sendSuccess(res, 201, 'Treatment log added successfully', rescueCase);
  } catch (error) {
    logger.error('Add treatment log error:', error);
    next(error);
  }
};
