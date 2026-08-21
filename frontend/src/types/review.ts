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
  message: string,
  data : {
    reviews: IReview[];
    pagination: IPagination;
  }
};

export interface ICreateReview {
  productId: string;
  rating: number;
  comment: string;
  images: File[] ;
  removeImageIds: string[];
  _id?: string;
}

export interface IDeleteReview {
  success: boolean;
  message: string;
}

export interface IUpdateReview {
  rating: number;
  comment: string;
  images: File[];
  removeImageIds: string[];
}
