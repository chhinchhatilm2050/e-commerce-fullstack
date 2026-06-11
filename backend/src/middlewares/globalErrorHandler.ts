import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';
import {
  handleCastError,
  handleDuplicateError,
  CastError,
  DuplicateFieldError,
} from '../utils/errorHandler.js';

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isDev = process.env.NODE_ENV === 'development';
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message };

  if (err.name === 'CastError') {
    error = handleCastError(err as CastError);
  }

  if (err.code === 11000) {
    error = handleDuplicateError(err as DuplicateFieldError);
  }

  if (isDev) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: err.stack,
    });
  } else {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      res.status(error.statusCode).json({
        status: error.statusCode,
        message: 'Something went wrong!',
      });
    }
  }
};

export default globalErrorHandler;
