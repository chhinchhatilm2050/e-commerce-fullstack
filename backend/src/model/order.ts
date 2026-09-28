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
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, default: null },
        color: { type: String, default: null},
        image: { type: String },
        code: { type: String },
      },
    ],
    subtotal: { 
      type: Number, 
      required: true,
      min: 0
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'aba_payway'],
      required: true,
    },

    // 1. Tracks the MONEY
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'UNPAID',
    },

    // 2. Tracks the LOGISTICS / DELIVERIES
    status: {
      type: String,
      enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
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

    // 3. Soft Delete Pattern
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    apv: { type: String, default: null },
    rawPaywayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
export default OrderModel;