import api from '../../api/axiosInstance';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const refreshToken = async (refreshToken) => {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
