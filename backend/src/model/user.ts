import mongoose, { Document, Types, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/validators.js';

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

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Invalid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    refreshToken: {
      type: String,
      default: null,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  if (!PASSWORD_REGEX.test(this.password)) {
    throw new Error('Invalid password');
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  inputPassword: string,
): Promise<boolean> {
  return bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.softDelete = async function (
  this: IUser,
  deletedBy: Types.ObjectId,
): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  await this.save();
};

userSchema.methods.isMatch = async function (
  this: IUser,
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.virtual('avatar').get(function (this: IUser) {
  const name = this.firstName?.charAt(0) ?? '';
  return name.toUpperCase();
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
