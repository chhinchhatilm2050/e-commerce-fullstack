import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import UserModel from '../model/user.js';
import { Request, Response, NextFunction } from 'express';

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('No token, please login', 401));
    }

    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
    } catch {
      return next(new AppError('Invalid or expired token', 401)); 
    }

    req.user = await UserModel.findById(payload.sub);

    if (!req.user) {
      return next(new AppError('User no longer exists', 401));
    }

    next();
  },
);