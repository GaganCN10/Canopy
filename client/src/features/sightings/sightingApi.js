import api from '../../api/axiosInstance';

export const createSighting = async (sightingData) => {
  const { data } = await api.post('/sightings', sightingData);
  return data;
};

export const getSightings = async (params = {}) => {
  const { data } = await api.get('/sightings', { params });
  return data;
};

export const getSightingById = async (id) => {
  const { data } = await api.get(`/sightings/${id}`);
  return data;
};

export const voteSighting = async (id, vote) => {
  const { data } = await api.post(`/sightings/${id}/vote`, { vote });
  return data;
};

export const uploadSightingImage = async (formData) => {
  const { data } = await api.post('/upload/species', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
