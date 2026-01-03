export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('Server error', { message: err.message, stack: err.stack });
  }

  res.status(status).json({
    status: 'error',
    message,
  });
}
