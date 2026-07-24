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

export const updateRescueCaseStatus = async (id, status, releaseNotes, requesterId, requesterRole) => {
  const rescueCase = await RescueCase.findById(id);
  if (!rescueCase) {
    throw new Error('Rescue case not found');
  }

  if (requesterRole !== 'admin' && rescueCase.rescuer.toString() !== requesterId.toString()) {
    throw new Error('You do not have permission to update this rescue case');
  }

  const update = { status };
  if (releaseNotes) update.releaseNotes = releaseNotes;
  const updated = await RescueCase.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('species', 'name scientificName')
    .populate('rescuer', 'firstName lastName email');
  return updated;
};

export const addTreatmentLog = async (caseId, logData, requesterId, requesterRole) => {
  const rescueCase = await RescueCase.findById(caseId);
  if (!rescueCase) {
    throw new Error('Rescue case not found');
  }

  if (requesterRole !== 'admin' && rescueCase.rescuer.toString() !== requesterId.toString()) {
    throw new Error('You do not have permission to add treatment logs to this rescue case');
  }

  const updated = await RescueCase.findByIdAndUpdate(
    caseId,
    { $push: { treatmentLogs: logData } },
    { new: true, runValidators: true },
  ).populate('species', 'name scientificName');
  return updated;
};
