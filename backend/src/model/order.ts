import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IOrder } from '../interface/iorder.js';

export interface IOrderDocument extends IOrder, Document {}

const orderSchema = new Schema<IOrderDocument>(
  {
    tran_id: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: false 
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        code: { type: String },
      },
    ],
    subtotal: { 
      type: Number, 
      required: true 
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['COD', 'aba_payway'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    customer: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
      preferredContactMethod: {
        type: String,
        enum: ['PHONE CALL', 'TELEGRAM'],
        default: 'PHONE CALL',
      },
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
      province: { type: String, required: true },
      commune: String,
      district: String,
      street: { type: String, required: true },
    },
    apv: { type: String, default: null },
    rawPaywayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
export default OrderModel;