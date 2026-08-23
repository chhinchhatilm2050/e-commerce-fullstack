import { Document, Types } from 'mongoose';
import { IProductImage } from './iproducts.js';

export interface IWhishlist extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  name: string,
  price: number,
  comparePrice: number,
  specification: Record<string, unknown>,
  images: IProductImage[],
  createdAt: Date;
  updatedAt: Date;
}