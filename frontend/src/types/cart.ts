import type { IProductImage } from './product';

export interface ISpecificationItem {
  key: string;
  value: string;
}

export interface ICartProduct {
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
  slug: string,
  code: string;
  specifications?: ISpecificationItem[];
  status: 'draft' | 'active' | 'out_of_stock';
};

export interface ICartItem {
  _id: string,
  id: string,
  productId: ICartProduct,
  selectedAttributes: Record<string, string>;
  quantity: number;
};

export interface ICart {
  _id: string,
  userId: string,
  items: ICartItem[],
};

export interface ICartRespone {
  success: boolean,
  data: {
    cart: ICart
  }
}
