import Tip from '../models/Tip.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const createTip = async (tipData) => {
  const tip = await Tip.create(tipData);
  return tip;
};

export const getTips = async ({ page = 1, limit = 20, status } = {}) => {
  const query = {};
  if (status) query.status = status;

  const tips = await Tip.find(query)
    .populate('submittedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Tip.countDocuments(query);

  return { tips, total, page, limit };
};

export const getTipById = async (id) => {
  const tip = await Tip.findById(id)
    .populate('submittedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName');
  if (!tip) {
    throw new Error('Tip not found');
  }
  return tip;
};

export const updateTipStatus = async (tipId, userId, status, reviewNotes) => {
  const tip = await Tip.findByIdAndUpdate(
    tipId,
    { status, reviewedBy: userId, reviewNotes },
    { new: true, runValidators: true },
  ).populate('submittedBy', 'firstName lastName email').populate('reviewedBy', 'firstName lastName');
  if (!tip) {
    throw new Error('Tip not found');
  }
  return tip;
};
