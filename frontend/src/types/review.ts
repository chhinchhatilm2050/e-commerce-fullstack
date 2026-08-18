import type { IPagination, IProductImage } from './product.ts';

export interface IReview {
  _id: string;
  productId: string;
  userId: { firstName: string; lastName: string; avatar?: string, _id: string | number};
  rating: number;
  comment?: string;
  images: IProductImage[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface IReviewRespone {
  success: boolean,
  data : {
    reviews: IReview[];
    pagination: IPagination;
  }
};
