import mongoose, { Model } from 'mongoose';
import type { IWhishlist } from '../interface/iwishlist.js';

const wishlistSchema = new mongoose.Schema<IWhishlist>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
}, { timestamps: true,  id: false });

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const WishlistModel: Model<IWhishlist> = mongoose.model<IWhishlist>('Wishlist', wishlistSchema);
export default WishlistModel;