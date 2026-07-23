import * as turf from '@turf/turf';
import HWCIncident from '../models/HWCIncident.js';
import GeofenceZone from '../models/GeofenceZone.js';
import Tip from '../models/Tip.js';
import Sighting from '../models/Sighting.js';
import { createNotification } from './notificationService.js';
import logger from '../utils/logger.js';

export const createHWCIncident = async (incidentData) => {
  const incident = await HWCIncident.create(incidentData);
  return incident;
};

export const getHWCIncidents = async ({ page = 1, limit = 20, type } = {}) => {
  const query = {};
  if (type) query.type = type;

  const incidents = await HWCIncident.find(query)
    .populate('reportedBy', 'firstName lastName email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await HWCIncident.countDocuments(query);

  return { incidents, total, page, limit };
};

export const getGeofenceZones = async () => {
  const zones = await GeofenceZone.find({ isActive: true }).populate('createdBy', 'firstName lastName');
  return zones;
};

export const createGeofenceZone = async (zoneData) => {
  const zone = await GeofenceZone.create(zoneData);
  return zone;
};

export const checkGeofenceBreach = async (latitude, longitude, sourceType, sourceId) => {
  try {
    const zones = await GeofenceZone.find({ isActive: true });
    const point = turf.point([longitude, latitude]);

    let breachedZone = null;
    for (const zone of zones) {
      const polygon = turf.polygon(zone.geometry.coordinates);
      if (turf.booleanPointInPolygon(point, polygon)) {
        breachedZone = zone;
        break;
      }
    }

    if (!breachedZone) return null;

    logger.info(`Geofence breach detected: ${breachedZone.name} for ${sourceType} ${sourceId}`);

    return {
      zone: breachedZone,
      message: `Activity detected inside geofence zone: ${breachedZone.name}`,
    };
  } catch (error) {
    logger.error('Geofence breach check error:', error);
    return null;
  }
};

export const recordHWCIncidentForSighting = async (sighting) => {
  if (!sighting.location?.coordinates || sighting.location.coordinates.length !== 2) return null;
  const [lng, lat] = sighting.location.coordinates;
  const breach = await checkGeofenceBreach(lat, lng, 'sighting', sighting._id);
  if (!breach) return null;

  const incident = await createHWCIncident({
    type: 'crop_raiding',
    description: `Sighting (${sighting._id}) detected inside geofence zone: ${breach.zone.name}. ${breach.message}`,
    location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    reportedBy: sighting.reporter,
    status: 'reported',
  });

  await createNotification({
    recipient: sighting.reporter.toString(),
    type: 'geofence_breach',
    title: 'Geofence Breach Alert',
    message: `Your sighting was detected inside the "${breach.zone.name}" zone. Rangers have been notified.`,
    data: { sightingId: sighting._id, zoneId: breach.zone._id, zoneName: breach.zone.name },
    channels: { inApp: true, email: true },
  });

  return { incident, zone: breach.zone };
};
