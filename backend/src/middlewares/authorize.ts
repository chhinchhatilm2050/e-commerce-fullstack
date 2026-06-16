import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import { Model, Document } from 'mongoose';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if(!roles.length) {
      return next(new AppError('No roles specified for this route', 500));
    }

    if(!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`Role ${req.user?.role} is not authorize to access this route`, 403));
    }
    next();
  };
};

export const checkOwnership = <T extends Document>(Model: Model<T>, ownField: keyof T & string) => {
  return asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    const resource = await Model.findById(req.params.id);
    if(!resource) {
      return next(new AppError('Resource not found', 400));
    };

    const isOwner = resource[ownField]?.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if(!isAdmin && !isOwner) {
      return next(new AppError('You do not have permission to modify this resource', 403));
    }

    req.resource = resource;
    next();
  });
};