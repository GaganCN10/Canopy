import api from '../../api/axiosInstance';

export const predictSpeciesImage = async (formData) => {
  const { data } = await api.post('/ml/species-predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const triageCameraTrap = async (formData) => {
  const { data } = await api.post('/ml/camera-trap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const predictBioacoustic = async (formData) => {
  const { data } = await api.post('/ml/bioacoustic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const predictThreatAudio = async (formData) => {
  const { data } = await api.post('/ml/threat-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getHabitatNDVI = async (payload) => {
  const { data } = await api.post('/ml/habitat-ndvi', payload);
  return data;
};

export const getPoachingHotspots = async (payload) => {
  const { data } = await api.post('/ml/poaching-hotspots', payload);
  return data;
};

export const getPopulationForecast = async (payload) => {
  const { data } = await api.post('/ml/population-forecast', payload);
  return data;
};

export const detectAnomalies = async (payload) => {
  const { data } = await api.post('/ml/anomalies', payload);
  return data;
};

export const getMovementCorridors = async (formData) => {
  const { data } = await api.post('/ml/movement-corridors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const scanTradeText = async (payload) => {
  const { data } = await api.post('/trade-scan/scan', payload);
  return data;
};

export const getTradeFlags = async (params = {}) => {
  const { data } = await api.get('/trade-scan/flags', { params });
  return data;
};

export const updateTradeFlag = async (id, payload) => {
  const { data } = await api.patch(`/trade-scan/flags/${id}`, payload);
  return data;
};
