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
