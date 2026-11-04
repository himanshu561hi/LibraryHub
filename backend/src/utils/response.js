/**
 * Standardized API Response Utilities for Library Hub REST API.
 */

export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = 'An error occurred',
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  details = null
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
  });
};

