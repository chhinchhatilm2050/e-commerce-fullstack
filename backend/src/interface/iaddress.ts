import { Document, Types } from 'mongoose';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  label: string; 
  streetAddress: string;
  phoneNumber: string;
  province: string;
  district: string;
  commune: string;
  updatedBy?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  softDelete(deletedBy: Types.ObjectId): Promise<void>;
}