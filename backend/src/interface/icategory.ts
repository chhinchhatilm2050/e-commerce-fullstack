import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId: Types.ObjectId | null; 
  image?: string;
  imagePublicId?: string;
  status: 'active' | 'inactive';
  description?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(deletedBy: Types.ObjectId): Promise<void>;
  _id: Types.ObjectId;
};

export interface ICategoryTreeNode {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: string; 
  status: 'active' | 'inactive';
  description?: string; 
  children: ICategoryTreeNode[];
};

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}