import mongoose, { Model, Query } from 'mongoose';
import type { IProduct } from '../interface/iproducts.js';

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: { 
    type: String, 
    default: null,
    trim: true 
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0,
    default: null
  },
  image: {
    url: { type: String, default: ''},
    publicId: { type: String, default: ''}
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }
  ],
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  }, 
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  specification: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: { 
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
}, 
{ 
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ name: 'text', description: 'text' });

productSchema.methods.softDelete = async function (this: IProduct, deletedBy: mongoose.Types.ObjectId): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  await this.save({ validateBeforeSave: false });
};

productSchema.pre(/^find/, function (this: Query<unknown, IProduct>): void {
  const filter = this.getFilter();
  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;