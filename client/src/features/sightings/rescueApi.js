import api from '../../api/axiosInstance';

export const createRescueCase = async (caseData) => {
  const { data } = await api.post('/rescue', caseData);
  return data;
};

export const getRescueCases = async (params = {}) => {
  const { data } = await api.get('/rescue', { params });
  return data;
};

export const getRescueCaseById = async (id) => {
  const { data } = await api.get(`/rescue/${id}`);
  return data;
};

export const updateRescueCaseStatus = async (id, statusData) => {
  const { data } = await api.put(`/rescue/${id}/status`, statusData);
  return data;
};

export const addTreatmentLog = async (id, logData) => {
  const { data } = await api.post(`/rescue/${id}/treatment`, logData);
  return data;
};
