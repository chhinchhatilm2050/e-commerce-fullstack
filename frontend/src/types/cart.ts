import type { IProductImage } from './product';

export interface ICartProduct {
  _id: string,
  name: string,
  price: number,
  images: IProductImage[],
  code: string,
  stock: number,
  specification?: Record<string, unknown>;
};

export interface ICartItem {
  _id: string,
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
