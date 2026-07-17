import { Types, Document } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
  recalculateProductRating(productId: Types.ObjectId): Promise<void>;
}

export interface IAggregationResult {
  _id: Types.ObjectId;
  avg: number;
  count: number;
}