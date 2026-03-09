import { ErrorLog } from '../../database/models.js';
import logger from '../../logs/logger.js';

// Error handling middleware requires 4 arguments
async function globalErrorHandler(err, req, res, _next) {
  clearTimeout(req?.timeout);
  let userType = 'User';
  if (req.originalUrl.includes('/v1/admin')) {
    userType = 'Admin';
  }
  let statusCode = err?.statusCode || 500;
  let message = err?.message;
  if (err?.message === 'Validation failed') {
    statusCode = 400;
    err.details.forEach((validationErr) => {
      message = `Validation failed: ${validationErr?.details[0]?.message}`;
    });
  }
  const date = new Date();
  const errorLog = new ErrorLog({
    email: req?.user?.email || '-',
    errorType: err?.name,
    userType,
    url: req?.url,
    httpMethod: req?.method,
    body: JSON.stringify(req?.body),
    statusCode,
    message,
    stack: err?.stack,
    createdAt: {
      readableDate: date.toUTCString(),
      isoDate: date.toISOString(),
      month: date.getMonth(),
      year: date.getFullYear(),
    },
  });
  await errorLog.save();
  logger.error(err);
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
    },
  });
}

export default globalErrorHandler;
