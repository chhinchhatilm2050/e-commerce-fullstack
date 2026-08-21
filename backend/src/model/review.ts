import mongoose from 'mongoose';
import type { IReview, IAggregationResult, IReviewModel } from '../interface/ireview.js';
import ProductModel from './product.js';

const reviewSchema = new mongoose.Schema<IReview, IReviewModel>({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500,
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      isPrimary: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }
  ],
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  id: false
});

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

reviewSchema.statics.recalculateProductRating = async function (productId: mongoose.Types.ObjectId): Promise<void> {
  const stats = await this.aggregate<IAggregationResult>([
    { $match: { productId }},
    { $group: { _id: '$productId', avg: { $avg: '$rating'}, count: { $sum: 1}}},
  ]);

  if (stats.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingAvg: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  } else {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingAvg: 0,
      ratingCount: 0 
    });
  }
};

const ReviewModel: IReviewModel = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);
export default ReviewModel;