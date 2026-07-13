import UserModel from '../model/user.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import type { IUser, UpdateUserBody, UpdateMe } from '../interface/iuser.js';

export const promoteToAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  },
);

export const getSingleUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await UserModel.findById(req.params.id).select(
      '-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy',
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  },
);

export const getAllUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find({ isDeleted: false })
        .select(
          '-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy',
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments({ isDeleted: false }),
    ]);

    res.status(200).json({
      success: true,
      result: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { users },
    });
  },
);

export const updateUser = asyncHandler(
  async (
    req: Request<{ id: string }, unknown, UpdateUserBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if(!user) {
      return next(new AppError('User not found', 404));
    };

    if (Object.keys(req.body).length === 0) {
      return next(
        new AppError('Please provide at least one field to update', 400),
      );
    }
    const { firstName, lastName, phoneNumber, email, gender } = req.body;
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.email = email ?? user.email;
    user.gender = gender ?? user.gender;

    await user.save({ validateBeforeSave: true });

    const userObject = user.toObject() as IUser;
    const {
      refreshToken: _refreshToken,
      isDeleted: _isDeleted,
      deletedAt: _deletedAt,
      deletedBy: _deletedBy,
      updatedBy: _updatedBy,
      ...safeUser
    } = userObject;

    res.status(200).json({
      success: true,
      data: { user: safeUser },
    });
  },
);
export const updateMe = asyncHandler(
  async (
    req: Request<{ id: string }, unknown, UpdateMe>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (Object.keys(req.body).length === 0) {
      return next(
        new AppError('Please provide at least one field to update', 400),
      );
    }

    const { firstName, lastName, phoneNumber, gender } = req.body;
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.gender = gender ?? user.gender;

    await user.save({ validateBeforeSave: true });

    const userObject = user.toObject() as IUser;
    const {
      refreshToken: _refreshToken,
      isDeleted: _isDeleted,
      deletedAt: _deletedAt,
      deletedBy: _deletedBy,
      updatedBy: _updatedBy,
      ...safeUser
    } = userObject;

    res.status(200).json({
      success: true,
      message: 'Update profile successfully.',
      data: { user: safeUser },
    });
  },
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.resource as IUser;

    if (!req.user?._id) {
      return next(new AppError('Unauthorized', 401));
    }

    await user.softDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  },
);

export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await UserModel.findById(req.user?._id).select(
      '-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy',
    );
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  },
);
