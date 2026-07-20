import RescueCase from '../models/RescueCase.js';
import logger from '../utils/logger.js';

export const createRescueCase = async (caseData) => {
  const rescueCase = await RescueCase.create(caseData);
  return rescueCase;
};

export const getRescueCases = async ({ page = 1, limit = 20, status, center } = {}) => {
  const query = {};
  if (status) query.status = status;
  if (center) query.center = center;

  const cases = await RescueCase.find(query)
    .populate('species', 'name scientificName')
    .populate('rescuer', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await RescueCase.countDocuments(query);

  return { cases, total, page, limit };
};

export const getRescueCaseById = async (id) => {
  const rescueCase = await RescueCase.findById(id)
    .populate('species', 'name scientificName')
    .populate('rescuer', 'firstName lastName email');
  if (!rescueCase) {
    throw new Error('Rescue case not found');
  }
  return rescueCase;
};

export const updateRescueCaseStatus = async (id, status, releaseNotes) => {
  const update = { status };
  if (releaseNotes) update.releaseNotes = releaseNotes;
  const rescueCase = await RescueCase.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('species', 'name scientificName')
    .populate('rescuer', 'firstName lastName email');
  if (!rescueCase) {
    throw new Error('Rescue case not found');
  }
  return rescueCase;
};

export const addTreatmentLog = async (caseId, logData) => {
  const rescueCase = await RescueCase.findByIdAndUpdate(
    caseId,
    { $push: { treatmentLogs: logData } },
    { new: true, runValidators: true },
  ).populate('species', 'name scientificName');
  if (!rescueCase) {
    throw new Error('Rescue case not found');
  }
  return rescueCase;
};
