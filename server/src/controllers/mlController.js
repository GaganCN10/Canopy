import { sendSuccess, sendError } from '../utils/response.js';
import { predictSpeciesImage, triageCameraTrap, predictBioacoustic, predictThreatAudio } from '../services/mlService.js';
import { createTip } from '../services/tipService.js';
import { createNotification } from '../services/notificationService.js';
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
