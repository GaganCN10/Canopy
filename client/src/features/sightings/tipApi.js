import api from '../../api/axiosInstance';

export const submitTip = async (tipData) => {
  const { data } = await api.post('/tips', tipData);
  return data;
};

export const getTips = async (params = {}) => {
  const { data } = await api.get('/tips', { params });
  return data;
};

export const getTipById = async (id) => {
  const { data } = await api.get(`/tips/${id}`);
  return data;
};

export const updateTipStatus = async (id, statusData) => {
  const { data } = await api.put(`/tips/${id}/status`, statusData);
  return data;
};
