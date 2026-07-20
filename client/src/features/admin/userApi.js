import api from '../../api/axiosInstance';

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/me', profileData);
  return data;
};

export const listUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

export const changeUserRole = async (userId, role) => {
  const { data } = await api.put(`/users/${userId}/role`, { role });
  return data;
};

export const banUser = async (userId) => {
  const { data } = await api.put(`/users/${userId}/ban`);
  return data;
};
