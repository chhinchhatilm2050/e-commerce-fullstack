import { AddressModel } from '../model/address.js';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import { IAddress } from '../interface/iaddress.js';

export const getMyAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user!._id;
  const address = await AddressModel.findOne({ userId, isDeleted: false });
  if (!address) {
    return next(new AppError('No shipping address found for the user', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { address }
  });
});

export const saveMyAddress = asyncHandler(async (req: Request<unknown, unknown, IAddress>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user!._id;
  const { phoneNumber, streetAddress, province, district, commune, label } = req.body;
  if (!phoneNumber || !streetAddress || !province || !district || !commune) {
    return next(new AppError('Missing required fields', 400));
  };  

  const address = await AddressModel.findOneAndUpdate(
    { userId, isDeleted: false },
    {
      userId,
      phoneNumber,
      streetAddress,
      province,
      district,
      commune,
      label: label || 'Home',
      updatedBy: userId,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address saved successfully',
    data: { address }
  });
});

export const deleteMyAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user!._id;
  const address = await AddressModel.findOne({ userId });
  if (!address || address.isDeleted) {
    return next(new AppError('No shipping address found for the user', 404));
  };

  await address.softDelete(userId);
  res.status(200).json({
    status: 'success',
    message: 'Address deleted successfully',
  });
});

