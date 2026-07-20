import { validationResult } from 'express-validator';
import {
  createHWCIncident,
  getHWCIncidents,
  getGeofenceZones,
  createGeofenceZone,
  recordHWCIncidentForSighting,
} from '../services/hwcService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const createHWCIncidentHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { type, description, lat, lng, lossDescription } = req.body;

    const incident = await createHWCIncident({
      type,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      lossDescription,
      reportedBy: req.user._id,
    });

    sendSuccess(res, 201, 'HWC incident reported successfully', incident);
  } catch (error) {
    logger.error('Create HWC incident error:', error);
    next(error);
  }
};

export const listHWCIncidentsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const result = await getHWCIncidents({ page: parseInt(page, 10), limit: parseInt(limit, 10), type });
    sendSuccess(res, 200, 'HWC incidents fetched successfully', result);
  } catch (error) {
    logger.error('List HWC incidents error:', error);
    next(error);
  }
};

export const listGeofenceZonesHandler = async (req, res, next) => {
  try {
    const zones = await getGeofenceZones();
    sendSuccess(res, 200, 'Geofence zones fetched successfully', zones);
  } catch (error) {
    logger.error('List geofence zones error:', error);
    next(error);
  }
};

export const createGeofenceZoneHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { name, description, coordinates } = req.body;

    const zone = await createGeofenceZone({
      name,
      description,
      geometry: { type: 'Polygon', coordinates },
      createdBy: req.user._id,
    });

    sendSuccess(res, 201, 'Geofence zone created successfully', zone);
  } catch (error) {
    logger.error('Create geofence zone error:', error);
    next(error);
  }
};

export const checkSightingGeofenceHandler = async (req, res, next) => {
  try {
    const incident = await recordHWCIncidentForSighting(req.sighting);
    if (incident) {
      sendSuccess(res, 201, 'HWC incident recorded due to geofence breach', incident);
    } else {
      sendSuccess(res, 200, 'No geofence breach detected', null);
    }
  } catch (error) {
    logger.error('Geofence check error:', error);
    next(error);
  }
};
