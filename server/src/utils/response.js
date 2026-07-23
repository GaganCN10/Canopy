const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = 'Server Error', errors = null, code = null) => {
  const errorCode = code || mapStatusToErrorCode(statusCode, message);
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    code: errorCode,
  });
};

const mapStatusToErrorCode = (status, message = '') => {
  const lowerMessage = (message || '').toLowerCase();
  if (status === 401) {
    if (lowerMessage.includes('token') || lowerMessage.includes('expired')) return 'AUTH_004';
    if (lowerMessage.includes('password')) return 'AUTH_001';
    return 'AUTH_005';
  }
  if (status === 403) return 'AUTH_006';
  if (status === 404) return 'RES_001';
  if (status === 422 || status === 400) return 'VAL_001';
  if (status === 413) return 'FILE_001';
  if (status === 429) return 'RATE_001';
  if (status >= 500) return 'SYS_002';
  return 'SYS_002';
};

export { sendSuccess, sendError, mapStatusToErrorCode };
