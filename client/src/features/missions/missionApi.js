import api from '../../api/axiosInstance';

export const getMissions = async (params = {}) => {
  const { data } = await api.get('/missions', { params });
  return data;
};

export const getMission = async (missionId) => {
  const { data } = await api.get(`/missions/${missionId}`);
  return data;
};

export const createMission = async (missionData) => {
  const { data } = await api.post('/missions', missionData);
  return data;
};

export const updateMission = async (missionId, missionData) => {
  const { data } = await api.patch(`/missions/${missionId}`, missionData);
  return data;
};

export const joinMission = async (missionId, message = '') => {
  const { data } = await api.post(`/missions/${missionId}/join`, { message });
  return data;
};

export const approveJoinRequest = async (missionId, userId) => {
  const { data } = await api.post(`/missions/${missionId}/join-requests/${userId}/approve`);
  return data;
};

export const removeMember = async (missionId, userId) => {
  const { data } = await api.delete(`/missions/${missionId}/members/${userId}`);
  return data;
};

export const addCoLead = async (missionId, userId) => {
  const { data } = await api.post(`/missions/${missionId}/co-leads/${userId}`);
  return data;
};

export const getMissionThread = async (missionId) => {
  const { data } = await api.get(`/missions/${missionId}/thread`);
  return data;
};

export const createThreadPost = async (missionId, postData) => {
  const { data } = await api.post(`/missions/${missionId}/thread`, postData);
  return data;
};

export const getMissionTasks = async (missionId) => {
  const { data } = await api.get(`/missions/${missionId}/tasks`);
  return data;
};

export const createMissionTask = async (missionId, taskData) => {
  const { data } = await api.post(`/missions/${missionId}/tasks`, taskData);
  return data;
};

export const updateMissionTask = async (missionId, taskId, taskData) => {
  const { data } = await api.patch(`/missions/${missionId}/tasks/${taskId}`, taskData);
  return data;
};

export const updateMissionStatus = async (missionId, status) => {
  const { data } = await api.patch(`/missions/${missionId}/status`, { status });
  return data;
};

export const getMyMissions = async () => {
  const { data } = await api.get('/missions/my');
  return data;
};
