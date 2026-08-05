import TradeFlag from '../models/TradeFlag.js';
import logger from '../utils/logger.js';
import { scanTradeText } from '../services/mlService.js';

export const createTradeFlag = async (flagData) => {
  const flag = await TradeFlag.create(flagData);
  return flag;
};

export const getTradeFlags = async ({ page = 1, limit = 20, status } = {}) => {
  const query = {};
  if (status) query.status = status;

  const flags = await TradeFlag.find(query)
    .populate('reviewedBy', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await TradeFlag.countDocuments(query);

  return { flags, total, page, limit };
};

export const getTradeFlagById = async (id) => {
  const flag = await TradeFlag.findById(id).populate('reviewedBy', 'firstName lastName email');
  if (!flag) {
    throw new Error('Trade flag not found');
  }
  return flag;
};

export const updateTradeFlagStatus = async (flagId, userId, status, reviewNotes) => {
  if (!['approved', 'dismissed'].includes(status)) {
    throw new Error('Status must be approved or dismissed');
  }

  const flag = await TradeFlag.findByIdAndUpdate(
    flagId,
    { status, reviewedBy: userId, reviewNotes },
    { new: true, runValidators: true },
  ).populate('reviewedBy', 'firstName lastName email');

  if (!flag) {
    throw new Error('Trade flag not found');
  }
  return flag;
};

export const scanAndCreateFlag = async (source, text) => {
  try {
    const result = await scanTradeText({ text, source });
    const data = result.data || {};

    if (data.is_flagged && data.confidence >= 0.45) {
      const existing = await TradeFlag.findOne({ text, source, status: 'pending' });
      if (existing) return existing;

      return await createTradeFlag({
        source,
        text,
        isFlagged: true,
        confidence: data.confidence,
        matchedKeywords: data.matched_keywords || [],
        status: 'pending',
      });
    }

    return null;
  } catch (error) {
    logger.error('Trade scan failed:', error);
    throw error;
  }
};
