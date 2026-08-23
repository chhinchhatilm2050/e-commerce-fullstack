import type { IProductImage } from './product';

export interface IItem {
  _id: string;
  name: string;
  price: number;
  code: string,
  slug: string,
  comparePrice: number;
  specification: Record<string,unknown>;
  images: IProductImage[]; 
  createdAt: string;       
  updatedAt: string;
}

export interface IWishlistItem {
  _id: string;
  userId: string;
  productId: IItem;
}

export interface IWishlistResponse {
  success: boolean;
  data: {
    wishlist: IWishlistItem[]; 
  };
}

export interface IDeleteRespone {
  success: boolean,
  message: string,
};

export interface IAddRespone {
  success: boolean,
  message: string,
  populated: IWishlistItem
};

