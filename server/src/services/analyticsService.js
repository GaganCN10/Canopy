import Sighting from '../models/Sighting.js';
import Tip from '../models/Tip.js';
import HWCIncident from '../models/HWCIncident.js';
import RescueCase from '../models/RescueCase.js';
import logger from '../utils/logger.js';

export const getSightingsOverTime = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Sighting.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data.map((item) => ({
    date: item._id,
    count: item.count,
  }));
};

export const getSpeciesDistribution = async () => {
  const data = await Sighting.aggregate([
    {
      $group: {
        _id: '$species',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'species',
        localField: '_id',
        foreignField: '_id',
        as: 'species',
      },
    },
    { $unwind: '$species' },
    {
      $project: {
        name: '$species.name',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

export const getRegionalActivity = async () => {
  const data = await Sighting.aggregate([
    {
      $group: {
        _id: {
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
        },
        count: { $sum: 1 },
      },
    },
    { $limit: 100 },
  ]);

  return data.map((item) => ({
    lat: item._id.lat,
    lng: item._id.lng,
    count: item.count,
  }));
};

export const getVerificationStats = async () => {
  const data = await Sighting.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return data;
};

export const getDashboardSummary = async () => {
  const [
    totalSightings,
    totalTips,
    totalHWC,
    totalRescue,
    verifiedSightings,
  ] = await Promise.all([
    Sighting.countDocuments(),
    Tip.countDocuments(),
    HWCIncident.countDocuments(),
    RescueCase.countDocuments(),
    Sighting.countDocuments({ status: 'verified' }),
  ]);

  return {
    totalSightings,
    totalTips,
    totalHWC,
    totalRescue,
    verifiedSightings,
    verificationRate: totalSightings > 0 ? ((verifiedSightings / totalSightings) * 100).toFixed(1) : 0,
  };
};
