import mongoose, { Types, Model, Query } from 'mongoose';
import bcrypt from 'bcrypt';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/validators.js';
import type { IUser } from '../interface/iuser.js';

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      minlength: 0,
      maxlength: 50,
      trim: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      required: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Invalid email'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'inactive',
    },
    refreshToken: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCodeHash: {
      type: String,
      default: null,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    passwordResetCode: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
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

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 120,
    partialFilterExpression: { isVerified: false },
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
  await this.save({ validateBeforeSave: false });
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

userSchema.pre(/^find/, function (this: Query<unknown, IUser>): void {
  const filter = this.getFilter();
  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
