import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ReviewModel from '../model/review.js';
import ProductModel from '../model/product.js';
import AppError from '../utils/appError.js';
import { IReview } from '../interface/ireview.js';
import type { IProductImage } from '../interface/iproducts.js';
import { uploadTopCloudinary } from '../utils/uploadTocloudinary.js';
import { deleteFromCaloudinay } from '../utils/deleteFromCloudinary.js';

export const getProductReview = asyncHandler(
  async (
    req: Request<{ id: string }, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));

    const productExists = await ProductModel.exists({ _id: id });
    if (!productExists) {
      return next(new AppError('Product not found', 404));
    }

    const [reviews, total] = await Promise.all([
      ReviewModel.find({ productId: id })
        .populate('userId', 'firstName lastName avatar')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments({ productId: id }),
    ]);

    const totalPage = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPage,
          hasNextPage: page < totalPage,
          hasPrevPage: page > 1,
        },
      },
    });
  }
);

export const createReview = asyncHandler(async(req: Request<{ id: string }, unknown, { rating: number; comment?: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user!._id;
  const rating = Number(req.body.rating);
  const product = await ProductModel.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  };

  const files = req.files as Express.Multer.File[] | undefined;
  console.log(files);
  let images: IProductImage[] = [];
  
  if (files && files.length > 0 ) {
    const uploaded = await Promise.all(
      files.map((file) => uploadTopCloudinary(file.buffer, 'reviews'))
    );

    images = uploaded.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isPrimary: index === 0,
      order: index
    }));
  }
  const existingReview = await ReviewModel.findOne({ productId: id, userId });
  if (existingReview) {
    return next(new AppError('You already reviewed this product', 400));
  }

  // const verifiedPurchase = await checkVerifiedPurchase(userId, product._id);

  const reviews = new ReviewModel({
    productId: id,
    userId,
    rating,
    comment,
    images
  });

  await reviews.save();
  await ReviewModel.recalculateProductRating(product._id);

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: { reviews },
  });
}); 

export const updateReview = asyncHandler(async(req: Request<{ id: string; reviewId: string }, unknown, { rating?: number; comment?: string; removeImageIds: string }>, res: Response, next: NextFunction): Promise<void> => {
  const review = req.resource as IReview;
  const { rating, comment, removeImageIds } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (Object.keys(req.body).length === 0) {
    return next(new AppError('Please provide at least one field to update', 400));
  };

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (removeImageIds) {
    const idsTodelete = Array.isArray(removeImageIds) ? removeImageIds : [removeImageIds];
    await Promise.all(idsTodelete.map((publicId) => deleteFromCaloudinay(publicId as string)));
    review.images = review.images.filter((img) => !idsTodelete.includes(img.publicId));
  };

  if (files && files.length > 0) {
    const uploaded = await Promise.all(
      files.map((file) => uploadTopCloudinary(file.buffer, 'reviews'))
    );
    const newImages: IProductImage[] = uploaded.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isPrimary: review.images.length === 0 && index === 0,
      order: review.images.length + index,
    }));

    review.images.push(...newImages);
  }

  await review.save();
  await ReviewModel.recalculateProductRating(review.productId);

  res.status(200).json({
    success: true,
    message: 'Review updatted successfully',
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