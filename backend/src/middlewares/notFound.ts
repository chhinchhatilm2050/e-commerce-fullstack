import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export default notFound;
