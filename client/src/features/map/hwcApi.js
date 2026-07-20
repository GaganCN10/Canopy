import api from '../../api/axiosInstance';

export const createHWCIncident = async (incidentData) => {
  const { data } = await api.post('/hwc/incidents', incidentData);
  return data;
};

export const getHWCIncidents = async (params = {}) => {
  const { data } = await api.get('/hwc/incidents', { params });
  return data;
};

export const getGeofenceZones = async () => {
  const { data } = await api.get('/hwc/zones');
  return data;
};

export const createGeofenceZone = async (zoneData) => {
  const { data } = await api.post('/hwc/zones', zoneData);
  return data;
};
