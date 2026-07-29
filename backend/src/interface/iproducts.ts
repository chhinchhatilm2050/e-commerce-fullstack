import { Types, Document } from 'mongoose';
export interface IProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string,
  description: string;
  categoryId: Types.ObjectId;
  price: number;
  comparePrice?: number;             
  images: IProductImage[];   
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  specification?: Record<string, unknown>;
  status: string;
  updatedBy?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(deletedBy: Types.ObjectId): Promise<void>;
  _id: Types.ObjectId;
}

export interface IPaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IQueryResult<T> {
  data: T[];
  pagination: IPaginationResult;
}

export interface PriceRange {
  $gte?: number;
  $lte?: number;
}

export interface BaseFilter {
  isDeleted: boolean;
  isActive?: boolean;
  price?: PriceRange;
  $text?: { $search: string };
  [key: string]: unknown;
}

export interface CreateProductBody {
  name: string;
  description: string;
  price: number;         
  comparePrice?: number;  
  categoryId: Types.ObjectId;
  stock: number;          
  specification?: string | undefined; 
}