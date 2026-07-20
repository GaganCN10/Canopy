import api from '../../api/axiosInstance';

export const getSpecies = async (params = {}) => {
  const { data } = await api.get('/species', { params });
  return data;
};

export const getSpeciesById = async (id) => {
  const { data } = await api.get(`/species/${id}`);
  return data;
};

export const createSpecies = async (speciesData) => {
  const { data } = await api.post('/species', speciesData);
  return data;
};

export const updateSpecies = async (id, speciesData) => {
  const { data } = await api.put(`/species/${id}`, speciesData);
  return data;
};

export const deleteSpecies = async (id) => {
  const { data } = await api.delete(`/species/${id}`);
  return data;
};

export const uploadSpeciesImage = async (formData) => {
  const { data } = await api.post('/upload/species', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
