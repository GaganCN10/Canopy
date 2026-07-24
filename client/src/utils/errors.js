const ERROR_MESSAGES = {
  AUTH_001: {
    title: 'Login Failed',
    message: 'Invalid email or password.',
    remedy: 'Please check your credentials and try again. If you forgot your password, use the reset option.',
  },
  AUTH_002: {
    title: 'Account Not Found',
    message: 'No account exists with this email.',
    remedy: 'Please register first or verify your email address.',
  },
  AUTH_003: {
    title: 'Account Already Exists',
    message: 'An account with this email already exists.',
    remedy: 'Please log in instead, or use a different email address.',
  },
  AUTH_004: {
    title: 'Session Expired',
    message: 'Your login session has expired.',
    remedy: 'Please log in again to continue.',
  },
  AUTH_005: {
    title: 'Unauthorized',
    message: 'Please log in to access this page.',
    remedy: 'You need to be logged in to view this content.',
  },
  AUTH_006: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    remedy: 'Contact an administrator if you believe this is an error.',
  },
  AUTH_007: {
    title: 'Account Locked',
    message: 'Your account is temporarily locked due to multiple failed login attempts.',
    remedy: 'Please wait 30 minutes before trying again, or contact support for immediate assistance.',
  },
  VAL_001: {
    title: 'Invalid Input',
    message: 'Please correct the highlighted fields.',
    remedy: 'Check the form for errors and try submitting again.',
  },
  RES_001: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
    remedy: 'The item may have been removed or the link is outdated.',
  },
  SYS_001: {
    title: 'Connection Error',
    message: 'Cannot reach the server.',
    remedy: 'Check your internet connection and try refreshing the page.',
  },
  SYS_002: {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    remedy: 'Please try again in a few minutes. If the issue persists, contact support.',
  },
  SYS_003: {
    title: 'Service Unavailable',
    message: 'The service is temporarily down for maintenance.',
    remedy: 'Please try again shortly.',
  },
  FILE_001: {
    title: 'Upload Failed',
    message: 'The file could not be uploaded.',
    remedy: 'Ensure the file is under the size limit and in an accepted format (JPG, PNG, PDF), then retry.',
  },
  RATE_001: {
    title: 'Too Many Requests',
    message: 'You have made too many requests.',
    remedy: 'Please wait a few minutes before trying again.',
  },
};

const getErrorMessage = (error) => {
  if (!error) return null;

  const code = error.code || error.response?.data?.code;
  const serverMessage = error.response?.data?.message || error.message || '';
  const mappedMessage = ERROR_MESSAGES[code] || {};

  if (code && mappedMessage.title) {
    return {
      title: mappedMessage.title,
      message: serverMessage || mappedMessage.message,
      remedy: mappedMessage.remedy,
    };
  }

  if (error.code === 'ECONNABORTED' || serverMessage.toLowerCase().includes('timeout')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      remedy: 'Please check your connection and try again.',
    };
  }

  if (!error.response) {
    return {
      title: 'Network Error',
      message: 'Cannot connect to the server.',
      remedy: 'Check your internet connection and ensure the backend is running, then refresh the page.',
    };
  }

  const status = error.response?.status;

  if (status === 401) {
    return {
      title: 'Unauthorized',
      message: serverMessage || 'Your session has expired.',
      remedy: 'Please log in again.',
    };
  }

  if (status === 403) {
    return {
      title: 'Access Denied',
      message: serverMessage || 'You do not have permission to access this resource.',
      remedy: 'If you believe this is an error, contact an administrator. Otherwise, log out and try again with a different account.',
    };
  }

  if (status === 404) {
    return {
      title: 'Not Found',
      message: serverMessage || 'The requested resource was not found.',
      remedy: 'Please check the URL or go back to the home page.',
    };
  }

  if (status === 422 || status === 400) {
    return {
      title: 'Invalid Input',
      message: serverMessage || 'Please correct the form errors.',
      remedy: 'Check the highlighted fields and try again.',
    };
  }

  if (status === 413) {
    return {
      title: 'File Too Large',
      message: 'The uploaded file exceeds the size limit.',
      remedy: 'Please upload a smaller file (max 5MB).',
    };
  }

  if (status === 429) {
    return {
      title: 'Too Many Requests',
      message: 'You have made too many requests.',
      remedy: 'Please wait a few minutes before trying again.',
    };
  }

  if (status >= 500) {
    return {
      title: 'Server Error',
      message: serverMessage || 'Something went wrong on our end.',
      remedy: 'Please try again in a few minutes. If the issue persists, contact support.',
    };
  }

  return {
    title: 'Error',
    message: serverMessage || 'An unexpected error occurred.',
    remedy: 'Please try again or contact support if the issue continues.',
  };
};

export { getErrorMessage };
export default getErrorMessage;
