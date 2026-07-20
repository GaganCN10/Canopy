import { validationResult } from 'express-validator';
import {
  getSightingsOverTime,
  getSpeciesDistribution,
  getRegionalActivity,
  getVerificationStats,
  getDashboardSummary,
} from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const getSightingsOverTimeHandler = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await getSightingsOverTime(days);
    sendSuccess(res, 200, 'Sightings over time fetched successfully', data);
  } catch (error) {
    logger.error('Sightings over time error:', error);
    next(error);
  }
};

export const getSpeciesDistributionHandler = async (req, res, next) => {
  try {
    const data = await getSpeciesDistribution();
    sendSuccess(res, 200, 'Species distribution fetched successfully', data);
  } catch (error) {
    logger.error('Species distribution error:', error);
    next(error);
  }
};

export const getRegionalActivityHandler = async (req, res, next) => {
  try {
    const data = await getRegionalActivity();
    sendSuccess(res, 200, 'Regional activity fetched successfully', data);
  } catch (error) {
    logger.error('Regional activity error:', error);
    next(error);
  }
};

export const getVerificationStatsHandler = async (req, res, next) => {
  try {
    const data = await getVerificationStats();
    sendSuccess(res, 200, 'Verification stats fetched successfully', data);
  } catch (error) {
    logger.error('Verification stats error:', error);
    next(error);
  }
};

export const getDashboardSummaryHandler = async (req, res, next) => {
  try {
    const data = await getDashboardSummary();
    sendSuccess(res, 200, 'Dashboard summary fetched successfully', data);
  } catch (error) {
    logger.error('Dashboard summary error:', error);
    next(error);
  }
};
