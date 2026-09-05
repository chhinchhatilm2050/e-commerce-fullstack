import mongoose from 'mongoose';
import type { IAddress } from '../interface/iaddress.js';

const addressSchema = new mongoose.Schema<IAddress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      default: 'Home',
      maxlength: 30,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    streetAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    commune: {
      type: String,
      required: true,
      trim: true,
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
  }
);

addressSchema.methods.softDelete = async function (
  this: IAddress,
  deletedBy: mongoose.Types.ObjectId
): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  await this.save({ validateBeforeSave: false });
};

addressSchema.pre(
  /^find/,
  function (this: mongoose.Query<unknown, IAddress>): void {
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  }
);

export const AddressModel = mongoose.model<IAddress>('Address', addressSchema);