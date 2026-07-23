const ERROR_CODES = {
  AUTH_001: {
    message: 'Invalid email or password',
    remedy: 'Please check your credentials and try again. If you forgot your password, use the reset option.',
  },
  AUTH_002: {
    message: 'Account not found',
    remedy: 'Please register first or verify your email address.',
  },
  AUTH_003: {
    message: 'Account already exists',
    remedy: 'An account with this email already exists. Please log in instead.',
  },
  AUTH_004: {
    message: 'Token expired or invalid',
    remedy: 'Your session has expired. Please log in again.',
  },
  AUTH_005: {
    message: 'Unauthorized access',
    remedy: 'Please log in to access this resource.',
  },
  AUTH_006: {
    message: 'Insufficient permissions',
    remedy: 'You do not have permission to perform this action. Contact an administrator if you believe this is an error.',
  },
  VAL_001: {
    message: 'Validation failed',
    remedy: 'Please check the form fields and correct any invalid inputs.',
  },
  RES_001: {
    message: 'Resource not found',
    remedy: 'The requested resource does not exist or has been removed.',
  },
  SYS_001: {
    message: 'Database connection failed',
    remedy: 'The system is currently unavailable. Please try again in a few moments.',
  },
  SYS_002: {
    message: 'Internal server error',
    remedy: 'Something went wrong on our end. Please try again later or contact support if the issue persists.',
  },
  SYS_003: {
    message: 'Service temporarily unavailable',
    remedy: 'The service is temporarily down for maintenance. Please try again shortly.',
  },
  FILE_001: {
    message: 'File upload failed',
    remedy: 'Ensure the file is under the size limit and in an accepted format (JPG, PNG, PDF). Then retry.',
  },
  RATE_001: {
    message: 'Too many requests',
    remedy: 'You have made too many requests. Please wait a few minutes before trying again.',
  },
};

export const getErrorByCode = (code) => {
  return ERROR_CODES[code] || null;
};

export const mapHttpStatusToCode = (status, message = '') => {
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

  return null;
};

export default ERROR_CODES;
