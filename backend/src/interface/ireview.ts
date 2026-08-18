import { Types, Document, Model } from 'mongoose';
import { IProductImage } from './iproducts.js';

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  images: IProductImage[],
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}
export interface IReviewModel extends Model<IReview> {
  recalculateProductRating(productId: Types.ObjectId): Promise<void>;
}
export interface IAggregationResult {
  _id: Types.ObjectId;
  avg: number;
  count: number;
}