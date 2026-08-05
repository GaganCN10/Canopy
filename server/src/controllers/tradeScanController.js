import { sendSuccess, sendError } from '../utils/response.js';
import { scanAndCreateFlag, getTradeFlags, getTradeFlagById, updateTradeFlagStatus } from '../services/tradeScanService.js';
import logger from '../utils/logger.js';

export const scanTradeTextHandler = async (req, res, next) => {
  try {
    const { text, source } = req.body;

    if (!text) {
      return sendError(res, 400, 'text is required');
    }

    const result = await scanAndCreateFlag(source || 'manual', text);
    sendSuccess(res, 200, 'Trade text scan completed', {
      flagged: !!result,
      confidence: result?.confidence || 0,
      matchedKeywords: result?.matchedKeywords || [],
      flagId: result?._id || null,
    });
  } catch (error) {
    logger.error('Trade scan error:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Trade scan failed';
    sendError(res, status, message);
  }
};

export const getTradeFlagsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await getTradeFlags({ page: Number(page), limit: Number(limit), status });
    sendSuccess(res, 200, 'Trade flags fetched', result);
  } catch (error) {
    logger.error('Get trade flags error:', error);
    sendError(res, 500, error.message || 'Failed to fetch trade flags');
  }
};

export const getTradeFlagByIdHandler = async (req, res, next) => {
  try {
    const flag = await getTradeFlagById(req.params.id);
    sendSuccess(res, 200, 'Trade flag fetched', flag);
  } catch (error) {
    logger.error('Get trade flag error:', error);
    sendError(res, 404, error.message || 'Trade flag not found');
  }
};

export const updateTradeFlagStatusHandler = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const flag = await updateTradeFlagStatus(req.params.id, req.user._id, status, reviewNotes);
    sendSuccess(res, 200, 'Trade flag status updated', flag);
  } catch (error) {
    logger.error('Update trade flag error:', error);
    sendError(res, 400, error.message || 'Failed to update trade flag');
  }
};
