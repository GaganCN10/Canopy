import { mapStatusToErrorCode } from '../utils/response.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;
  let code = err.code || mapStatusToErrorCode(statusCode, message);

  if (!err.statusCode && err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => e.message);
    code = 'VAL_001';
  }

  if (!err.statusCode && err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
    code = 'RES_001';
  }

  if (!err.statusCode && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    errors = Object.values(err.keyPattern || {}).map((key) => `${key} already exists`);
    code = 'VAL_001';
  }

  const logData = {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
    errors,
  };

  if (process.env.NODE_ENV === 'production') {
    delete logData.stack;
    if (statusCode >= 500) {
      message = 'Something went wrong. Please try again later.';
    }
  }

  logger.error(`[${code}] ${message}`, logData);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    code,
  });
};

export default errorHandler;
