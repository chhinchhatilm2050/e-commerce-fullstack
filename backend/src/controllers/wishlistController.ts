import WishlistModel from '../model/wishlist.js';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';

export const getWishlist = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const wishlist = await WishlistModel.find({ userId })
    .populate({
      path: 'productId',
      select: {
        price: 1,
        comparePrice: 1,
        name: 1,
        code: 1,
        slug: 1,
        specification: 1,
        images: { $slice: 1 }
      }
    });

  res.status(200).json({
    success: true,
    results: wishlist.length,
    data: { wishlist },
  });
});

export const addWishlist = asyncHandler(async (req: Request<{ productId: string }>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { productId } = req.params;

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  const newItem = await WishlistModel.create({
    userId,
    productId,
  });

  const populated = await newItem.populate(
    'productId',
    'price comparePrice name specification images code slug'
  );

  res.status(201).json({
    success: true,
    message: 'Item added to Wishlist successfully',
    populated ,
  });
});

export const deleteWishlist = asyncHandler(async (req: Request<{ productId: string }>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { productId } = req.params;

  const deleteDoc = await WishlistModel.findOneAndDelete({ userId, productId });

  if (!deleteDoc) {
    return next(new AppError('Item not found in wishlist', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Item removed from Wishlist successfully',
  });
});