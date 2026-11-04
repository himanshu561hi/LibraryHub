import logger from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Zod Validation Error
  if (err.name === 'ZodError') {
    return errorResponse(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid resource identifier: ${err.value}`, 400, 'INVALID_ID');
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return errorResponse(
      res,
      `Duplicate entry for field: ${fields.join(', ')}`,
      409,
      'DUPLICATE_ENTRY',
      err.keyValue
    );
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Explicit App Error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);
  const code = err.errorCode || 'INTERNAL_SERVER_ERROR';

  return errorResponse(res, message, statusCode, code);
};

export default errorHandler;

