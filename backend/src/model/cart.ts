import mongoose, { Model } from 'mongoose';
import { ICart } from '../interface/cart.js';
const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      selectedAttributes: {
        type: Map,
        of: String,
        default: {},
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1'],
        default: 1,
      },
    }
  ]
},
{
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
);
cartSchema.virtual('totalQuantity').get(function (this: ICart) {
  if (!this.items || !Array.isArray(this.items)) return 0;
  return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

const CartModel: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);
export default CartModel;