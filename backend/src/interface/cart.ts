import { Types } from 'mongoose';

export interface ICartItem {
  _id?: Types.ObjectId; 
  productId: Types.ObjectId;
  selectedAttributes?: Map<string, string>;
  quantity: number;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddToCartBody {
  selectedAttributes?: Record<string, string> | Map<string, string>;
  quantity?: number;
}

export interface IAddToCartParams {
  productId: string;
  itemId: string;
};

export interface IMergeGuestCartRequest {
  guestItems: ICartItem[];
}