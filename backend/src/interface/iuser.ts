import { Types, Document } from 'mongoose';
import type { CreateUserBody } from './iauth.js';
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  refreshToken?: string | null;
  isVerified: boolean;
  verificationCodeHash?: string | null;
  verificationCodeExpires?: Date | null;
  verificationAttempts: number;
  passwordResetCode?: string | null;
  passwordResetExpires?: Date | null;
  passwordResetAttempts: number;
  googleId: string,
  githubId: string,
  facebookId: string,
  orderCount: number;
  totalSpent: number;
  updatedBy?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(inputPassword: string): Promise<boolean>;
  softDelete(deletedBy: Types.ObjectId): Promise<void>;
  isMatch(enteredPassword: string): Promise<boolean>;
  _id: Types.ObjectId;
}

export type UpdateUserBody = Partial<Omit<CreateUserBody, 'password'>>;
export type UpdateMe = Partial<Omit<CreateUserBody, 'password' | 'email'>>;