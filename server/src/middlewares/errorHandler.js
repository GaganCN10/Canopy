const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  console.error(`[${new Date().toISOString()}] ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
