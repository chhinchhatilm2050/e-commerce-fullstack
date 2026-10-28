import UserModel from '../model/user.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { uploadTopCloudinary } from '../utils/uploadTocloudinary.js';
import { deleteFromCaloudinay } from '../utils/deleteFromCloudinary.js';
import AppError from '../utils/appError.js';
import type { IUser, UpdateUserBody, UpdateMe } from '../interface/iuser.js';
import QueryBuilder from '../utils/queryBuilder.js';

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
    const { fields: _fields, ...query } = req.query;

    const { data, pagination } = await new QueryBuilder(
      UserModel,
      { ...query},
      {
        isAdmin: true,
        allowedStatuses: ['active', 'inactive', 'blocked'],
        searchFields: ['firstName', 'lastName', 'email', 'phoneNumber'],
        allowedFilters: ['role', 'gender', 'isVerified'],
      },
    )
      .filter()
      .sort()
      .paginate()
      .select('-password,-refreshToken,-deletedAt,-deletedBy,-updatedBy')
      .execute();

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.status(200).json({
      success: true,
      result: data.length,
      data: { users: data },
      pagination,
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

export const updateUserStatus = asyncHandler(
  async (
    req: Request< {id: string}, unknown, { status: 'active' | 'inactive' | 'blocked'} >,res: Response,next: NextFunction,): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status);

    if (!['active', 'inactive', 'blocked'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const users = await UserModel.findById(id);
    if (!users) {
      return next(new AppError('User not found', 404));
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user?._id },
      { new: true , runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: { user },
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
  async (req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    await user?.softDelete(req.user!._id);

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

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('Unauthorized access', 401));
    }

    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    // 1. Fetch current user to check for an existing avatar to destroy
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    // 2. Upload new image to Cloudinary
    const uploaded = await uploadTopCloudinary(req.file.buffer, 'users');

    // 3. Remove old image from Cloudinary if it exists
    if (currentUser.imagePublicId) {
      await deleteFromCaloudinay(currentUser.imagePublicId);
    }

    // 4. Update database (fixed target ID parameter)
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        avatar: uploaded.url,
        imagePublicId: uploaded.publicId,
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy');

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { user },
    });
  }
);

export const getUserStats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const stats = await UserModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await UserModel.countDocuments({ isDeleted: false });

  res.status(200).json({
    success: true,
    data: {
      total,
      stats,
    },
  });
});