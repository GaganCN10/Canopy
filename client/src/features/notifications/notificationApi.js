import api from '../../api/axiosInstance';

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data;
};
