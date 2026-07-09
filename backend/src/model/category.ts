import { model, Schema, Types, Query } from 'mongoose';
import type { ICategory } from '../interface/icategory.js';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  image: {
    type: String,
    trim: true,
    default: '', 
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
}, {
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

categorySchema.pre('save', async function (this: ICategory): Promise<void> {
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

    while (await CategoryModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

categorySchema.methods.softDelete = async function (this: ICategory ,deletedBy: Types.ObjectId): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'inactive';
  await this.save({ validateBeforeSave: false });
};

categorySchema.pre(/^find/, function (this: Query<unknown, ICategory>): void {
  const filter = this.getFilter();
  if (filter.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

export const CategoryModel = model<ICategory>('Category', categorySchema);