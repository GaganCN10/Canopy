import api from '../../api/axiosInstance';

export const submitRoleRequest = async (formData, documentFile = null) => {
  const data = new FormData();
  data.append('requestedRole', formData.requestedRole);
  data.append('reason', formData.reason);
  data.append('orgOrDeptName', formData.orgOrDeptName);
  if (formData.inviteCode) {
    data.append('inviteCode', formData.inviteCode);
  }
  if (documentFile) {
    data.append('document', documentFile);
  }

  const { data: response } = await api.post('/role-requests', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const getMyRoleRequests = async () => {
  const { data } = await api.get('/role-requests/me');
  return data;
};

export const getAllRoleRequests = async (params = {}) => {
  const { data } = await api.get('/role-requests', { params });
  return data;
};

export const decideRoleRequest = async (requestId, action, reason = '') => {
  const { data } = await api.patch(`/role-requests/${requestId}`, { action, reason });
  return data;
};

export const tokenDecideRoleRequest = async (requestId, token, action) => {
  const { data } = await api.get(`/role-requests/${requestId}/decide`, {
    params: { token, action },
  });
  return data;
};

export const submitRoleProfile = async (profileData) => {
  const { data } = await api.post('/role-requests/role-profiles', profileData);
  return data;
};

export const createInviteCode = async (expiryDays = 30) => {
  const { data } = await api.post('/role-requests/invite-codes', { expiryDays });
  return data;
};

export const getInviteCodes = async () => {
  const { data } = await api.get('/role-requests/invite-codes');
  return data;
};

export const validateInviteCode = async (code) => {
  const { data } = await api.get(`/role-requests/invite-codes/${code}/validate`);
  return data;
};

export const redeemInviteCode = async (code) => {
  const { data } = await api.post(`/role-requests/invite-codes/${code}/redeem`);
  return data;
};
