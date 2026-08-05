export interface IProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  categoryId: string | { _id: string; name: string; slug: string };
  price: number;
  comparePrice?: number;
  images: IProductImage[];
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  specification?: Record<string, unknown>;
  status: 'draft' | 'active' | 'out_of_stock';
}

export interface IReview {
  _id: string;
  productId: string;
  userId: { firstName: string; lastName: string; avatar?: string };
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IProductListResponse {
  success: boolean;
  data: IProduct[];
  pagination: IPagination;
}

export interface IProductDetailResponse {
  success: boolean;
  data: {
    product: IProduct;
    reviews: IReview[];
    reviewPagination: IPagination;
  };
}
