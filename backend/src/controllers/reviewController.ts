import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ReviewModel from '../model/review.js';
import ProductModel from '../model/product.js';
import AppError from '../utils/appError.js';
import { IReview } from '../interface/ireview.js';

export const getProductReview = asyncHandler(async(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };
  
  const [ reviews, total ] = await Promise.all([
    ReviewModel.find({productId: id})
      .populate('userId', 'firstName lastName avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    ReviewModel.countDocuments({ productId: id }),
  ]);

  const totalPage = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: {
      pagination: {
        total,
        page,
        limit,
        totalPage,
        hasNextPage: page < totalPage,
        hasPrevPage: page > 1,
      },
      reviews,
    }
  });
});

export const createReview = asyncHandler(async(req: Request<{ id: string }, unknown, { rating: number; comment?: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!._id;

  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  const existingReview = await ReviewModel.findOne({ productId: id, userId });
  if (existingReview) {
    return next(new AppError('You already reviewed this product', 400));
  }

  // const verifiedPurchase = await checkVerifiedPurchase(userId, product._id);

  const review = new ReviewModel({
    productId: id,
    userId,
    rating,
    comment,
  });

  await review.save();
  await ReviewModel.recalculateProductRating(product._id);

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: { review },
  });
}); 

export const updateReview = asyncHandler(async(req: Request<{ id: string; reviewId: string }, unknown, { rating?: number; comment?: string }>, res: Response, next: NextFunction): Promise<void> => {
  const review = req.resource as IReview;
  const { rating, comment } = req.body;

  if (Object.keys(req.body).length === 0) {
    return next(new AppError('Please provide at least one field to update', 400));
  };

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  await ReviewModel.recalculateProductRating(review.productId);

  res.status(200).json({
    success: true,
    message: 'Review updatted successfully',
    data: { review },
  });
});

export const deleteReview = asyncHandler(async(req: Request<{ id: string; reviewId: string }>, res: Response, _next: NextFunction): Promise<void> => {
  const review = req.resource as IReview;

  const productId = review.productId;
  await ReviewModel.findByIdAndDelete(review._id);
  await ReviewModel.recalculateProductRating(productId);
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});