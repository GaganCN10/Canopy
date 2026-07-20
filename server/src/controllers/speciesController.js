import { validationResult } from 'express-validator';
import {
  createSpecies,
  getAllSpecies,
  getSpeciesById,
  updateSpecies,
  deleteSpecies,
} from '../services/speciesService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const createSpeciesHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const speciesData = {
      ...req.body,
      images: req.body.images || [],
    };

    const species = await createSpecies(speciesData);
    sendSuccess(res, 201, 'Species created successfully', species);
  } catch (error) {
    logger.error('Create species error:', error);
    next(error);
  }
};

export const listSpeciesHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await getAllSpecies({ page: parseInt(page, 10), limit: parseInt(limit, 10), search });
    sendSuccess(res, 200, 'Species fetched successfully', result);
  } catch (error) {
    logger.error('List species error:', error);
    next(error);
  }
};

export const getSpeciesHandler = async (req, res, next) => {
  try {
    const species = await getSpeciesById(req.params.id);
    sendSuccess(res, 200, 'Species fetched successfully', species);
  } catch (error) {
    logger.error('Get species error:', error);
    next(error);
  }
};

export const updateSpeciesHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const species = await updateSpecies(req.params.id, req.body);
    sendSuccess(res, 200, 'Species updated successfully', species);
  } catch (error) {
    logger.error('Update species error:', error);
    next(error);
  }
};

export const deleteSpeciesHandler = async (req, res, next) => {
  try {
    const species = await deleteSpecies(req.params.id);
    sendSuccess(res, 200, 'Species deleted successfully', species);
  } catch (error) {
    logger.error('Delete species error:', error);
    next(error);
  }
};
