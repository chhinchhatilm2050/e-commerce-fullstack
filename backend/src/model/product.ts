import mongoose, { Model, Query } from 'mongoose';
import type { IProduct } from '../interface/iproducts.js';

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
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
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      isPrimary: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }
  ],
  code: {
    type: String,
    unique: true,
  },
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
  status: {
    type: String,
    enum: ['draft', 'active', 'out_of_stock'],
    default: 'draft',
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
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ status: 1 });

productSchema.pre('save', async function (this: IProduct): Promise<void> {
  if (this.isModified('name')) {
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (!baseSlug) {
      baseSlug = 'category'; 
    }
    let slug = baseSlug;
    let counter = 1;

    while (await ProductModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

productSchema.pre('save', async function (this: IProduct): Promise<void> {
  if (!this.isNew || this.code) return; // skip if already has a code, or this is an update

  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  let code: string;
  let exists = true;

  while (exists && attempts < MAX_ATTEMPTS) {
    code = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString();
    exists = await ProductModel.exists({ code }).then(Boolean);
    attempts++;
  }

  if (exists) {
    throw new Error('Failed to generate a unique product code, please try again');
  }

  this.code = code!;
});

productSchema.pre('save', function () {
  if (this.isModified('stock') && this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  }
});

productSchema.methods.softDelete = async function (
  this: IProduct,
  deletedBy: mongoose.Types.ObjectId
): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
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