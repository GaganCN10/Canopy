import { sendSuccess, sendError } from '../utils/response.js';
import { predictSpeciesImage, triageCameraTrap, predictBioacoustic, predictThreatAudio, getHabitatNDVI, getPoachingHotspots, getPopulationForecast, detectAnomalies, getMovementCorridors } from '../services/mlService.js';
import { createTip } from '../services/tipService.js';
import { createNotification } from '../services/notificationService.js';
import Tip from '../models/Tip.js';
import Sighting from '../models/Sighting.js';
import logger from '../utils/logger.js';

export const predictSpeciesImageHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No image file uploaded');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const result = await predictSpeciesImage(formData);
    sendSuccess(res, 200, 'Species prediction completed', result.data);
  } catch (error) {
    logger.error('Species prediction error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Species prediction failed';
    sendError(res, status, message);
  }
};

export const triageCameraTrapHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No image file uploaded');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const result = await triageCameraTrap(formData);
    sendSuccess(res, 200, 'Camera trap triage completed', result.data);
  } catch (error) {
    logger.error('Camera trap triage error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Camera trap triage failed';
    sendError(res, status, message);
  }
};

export const predictBioacousticHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No audio file uploaded');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const result = await predictBioacoustic(formData);
    sendSuccess(res, 200, 'Bioacoustic prediction completed', result.data);
  } catch (error) {
    logger.error('Bioacoustic prediction error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Bioacoustic prediction failed';
    sendError(res, status, message);
  }
};

export const predictThreatAudioHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No audio file uploaded');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const result = await predictThreatAudio(formData);
    const top = result.data?.predictions?.[0] || { label: 'non_threat', confidence: 0 };
    sendSuccess(res, 200, 'Threat audio prediction completed', result.data);

    if (top.label === 'threat' && top.confidence >= 0.7 && req.user) {
      try {
        const tip = await createTip({
          title: `Threat sound detected: ${top.label}`,
          description: `Automated threat detection flagged audio as "${top.label}" with ${(top.confidence * 100).toFixed(1)}% confidence.`,
          submittedBy: req.user._id,
          isAnonymous: false,
          status: 'new',
        });

        await createNotification({
          recipient: req.user._id.toString(),
          type: 'tip_status_change',
          title: 'Threat sound detected',
          message: `Audio was classified as "${top.label}" with ${(top.confidence * 100).toFixed(1)}% confidence. A tip has been created.`,
          data: { tipId: tip._id },
          channels: { inApp: true, email: true },
        });
      } catch (tipError) {
        logger.error('Failed to create auto tip from threat audio:', tipError);
      }
    }
  } catch (error) {
    logger.error('Threat audio prediction error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Threat audio prediction failed';
    sendError(res, status, message);
  }
};

export const getHabitatNDVIHandler = async (req, res, next) => {
  try {
    const { bbox, start_date, end_date, max_cloud_cover = 20 } = req.body;

    if (!bbox || !start_date || !end_date) {
      return sendError(res, 400, 'bbox, start_date, and end_date are required');
    }

    if (!Array.isArray(bbox) || bbox.length !== 4) {
      return sendError(res, 400, 'bbox must be [min_lon, min_lat, max_lon, max_lat]');
    }

    const result = await getHabitatNDVI({ bbox, start_date, end_date, max_cloud_cover });
    sendSuccess(res, 200, 'NDVI computation completed', result.data);
  } catch (error) {
    logger.error('NDVI computation error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'NDVI computation failed';
    sendError(res, status, message);
  }
};

export const predictPoachingHotspotsHandler = async (req, res, next) => {
  try {
    const points = req.body.points;
    const bandwidth = req.body.bandwidth || 0.5;
    const grid_size = req.body.grid_size || 50;

    let sourcePoints = [];
    if (points && Array.isArray(points) && points.length >= 2) {
      sourcePoints = points.map((p) => ({ lat: p.lat, lon: p.lon }));
    } else {
      const tips = await Tip.find({ location: { $exists: true, $ne: null } })
        .select('location')
        .lean();
      const sightings = await Sighting.find({ location: { $exists: true, $ne: null } })
        .select('location')
        .lean();

      const tipPoints = tips
        .map((t) => t.location?.coordinates)
        .filter((c) => Array.isArray(c) && c.length === 2)
        .map(([lon, lat]) => ({ lat, lon }));

      const sightingPoints = sightings
        .map((s) => s.location?.coordinates)
        .filter((c) => Array.isArray(c) && c.length === 2)
        .map(([lon, lat]) => ({ lat, lon }));

      sourcePoints = [...tipPoints, ...sightingPoints];
    }

    if (sourcePoints.length < 2) {
      return sendSuccess(res, 200, 'Insufficient data for hotspot computation', {
        geojson: { type: 'FeatureCollection', features: [] },
        point_count: sourcePoints.length,
        feature_count: 0,
      });
    }

    const result = await getPoachingHotspots({
      points: sourcePoints,
      bandwidth,
      grid_size,
    });

    sendSuccess(res, 200, 'Poaching hotspot computation completed', result.data);
  } catch (error) {
    logger.error('Poaching hotspot computation error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Poaching hotspot computation failed';
    sendError(res, status, message);
  }
};

export const predictPopulationForecastHandler = async (req, res, next) => {
  try {
    const { speciesId, start_date, end_date, periods = 30 } = req.body;

    if (!speciesId) {
      return sendError(res, 400, 'speciesId is required');
    }

    const query = { species: speciesId };
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }

    const sightings = await Sighting.find(query)
      .select('timestamp')
      .sort({ timestamp: 1 })
      .lean();

    if (sightings.length < 2) {
      return sendSuccess(res, 200, 'Insufficient data for forecasting', {
        history: [],
        forecast: [],
        message: 'At least 2 sightings are required for population forecasting',
      });
    }

    const payload = {
      sightings: sightings.map((s) => ({
        timestamp: s.timestamp ? s.timestamp.toISOString() : null,
      })),
      periods,
    };

    const result = await getPopulationForecast(payload);
    sendSuccess(res, 200, 'Population forecast computed', result.data);
  } catch (error) {
    logger.error('Population forecast error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Population forecast failed';
    sendError(res, status, message);
  }
};

export const detectAnomaliesHandler = async (req, res, next) => {
  try {
    const { speciesId, bbox, start_date, end_date, window = 7, threshold = 2.0 } = req.body;

    const query = {};
    if (speciesId) query.species = speciesId;
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }
    if (bbox && bbox.length === 4) {
      query.location = {
        $geoWithin: {
          $box: [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ],
        },
      };
    }

    const sightings = await Sighting.find(query)
      .select('timestamp')
      .sort({ timestamp: 1 })
      .lean();

    const dailyMap = {};
    for (const s of sightings) {
      const ts = s.timestamp;
      if (!ts) continue;
      const day = new Date(ts);
      day.setHours(0, 0, 0, 0);
      const key = day.toISOString();
      dailyMap[key] = (dailyMap[key] || 0) + 1;
    }

    const time_series = Object.keys(dailyMap)
      .sort()
      .map((date) => ({ date, value: dailyMap[date] }));

    if (time_series.length < 2) {
      return sendSuccess(res, 200, 'Insufficient data for anomaly detection', {
        anomalies: [],
        total_points: time_series.length,
        message: 'At least 2 days of data are required',
      });
    }

    const result = await detectAnomalies(time_series, window=window, threshold=threshold);
    sendSuccess(res, 200, 'Anomaly detection completed', result.data);
  } catch (error) {
    logger.error('Anomaly detection error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Anomaly detection failed';
    sendError(res, status, message);
  }
};

export const predictMovementCorridorsHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded. Upload a GPX or CSV file with GPS coordinates.');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const result = await getMovementCorridors(formData);
    sendSuccess(res, 200, 'Movement corridor parsed', result.data);
  } catch (error) {
    logger.error('Movement corridor error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Movement corridor processing failed';
    sendError(res, status, message);
  }
};
