import Sighting from '../models/Sighting.js';
import Verification from '../models/Verification.js';
import { recordHWCIncidentForSighting } from './hwcService.js';
import logger from '../utils/logger.js';

export const createSighting = async (sightingData) => {
  const sighting = await Sighting.create(sightingData);
  try {
    await recordHWCIncidentForSighting(sighting);
  } catch (err) {
    logger.error('Geofence check failed after sighting creation:', err);
  }
  return sighting;
};

export const getSightings = async ({ page = 1, limit = 20, species, status, startDate, endDate, bbox } = {}) => {
  const query = {};

  if (species) query.species = species;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
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
    .populate('species', 'name scientificName conservationStatus')
    .populate('reporter', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ timestamp: -1 });

  const total = await Sighting.countDocuments(query);

  return { sightings, total, page, limit };
};

export const getSightingById = async (id) => {
  const sighting = await Sighting.findById(id)
    .populate('species', 'name scientificName conservationStatus description')
    .populate('reporter', 'firstName lastName email');
  if (!sighting) {
    throw new Error('Sighting not found');
  }
  return sighting;
};

export const voteOnSighting = async (sightingId, userId, vote) => {
  const sighting = await Sighting.findById(sightingId);
  if (!sighting) {
    throw new Error('Sighting not found');
  }

  let verification = await Verification.findOne({ sighting: sightingId, user: userId });

  if (verification) {
    if (verification.vote === vote) {
      await Verification.findByIdAndDelete(verification._id);
      sighting.verificationCount = Math.max(0, sighting.verificationCount - 1);
    } else {
      verification.vote = vote;
      await verification.save();
      sighting.verificationCount += vote === 'upvote' ? 1 : -1;
    }
  } else {
    await Verification.create({ sighting: sightingId, user: userId, vote });
    sighting.verificationCount += vote === 'upvote' ? 1 : -1;
  }

  if (sighting.verificationCount >= 3) {
    sighting.status = 'verified';
  } else if (sighting.verificationCount <= -3) {
    sighting.status = 'rejected';
  } else {
    sighting.status = 'pending';
  }

  await sighting.save();
  return sighting;
};
