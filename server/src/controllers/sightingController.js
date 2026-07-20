import { validationResult } from 'express-validator';
import {
  createSighting,
  getSightings,
  getSightingById,
  voteOnSighting,
} from '../services/sightingService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const createSightingHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const sightingData = {
      ...req.body,
      reporter: req.user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      },
    };

    const sighting = await createSighting(sightingData);
    sendSuccess(res, 201, 'Sighting created successfully', sighting);
  } catch (error) {
    logger.error('Create sighting error:', error);
    next(error);
  }
};

export const listSightingsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, species, status, startDate, endDate, bbox } = req.query;
    const result = await getSightings({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      species,
      status,
      startDate,
      endDate,
      bbox: bbox ? bbox.split(',').map(Number) : undefined,
    });
    sendSuccess(res, 200, 'Sightings fetched successfully', result);
  } catch (error) {
    logger.error('List sightings error:', error);
    next(error);
  }
};

export const getSightingHandler = async (req, res, next) => {
  try {
    const sighting = await getSightingById(req.params.id);
    sendSuccess(res, 200, 'Sighting fetched successfully', sighting);
  } catch (error) {
    logger.error('Get sighting error:', error);
    next(error);
  }
};

export const voteSightingHandler = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const sighting = await voteOnSighting(req.params.id, req.user._id, vote);
    sendSuccess(res, 200, 'Vote recorded successfully', sighting);
  } catch (error) {
    logger.error('Vote sighting error:', error);
    next(error);
  }
};
