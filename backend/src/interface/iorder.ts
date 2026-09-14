import { Request } from 'express';
import { Types } from 'mongoose';
import { IProductImage } from './iproducts.js';

export type PaymentMethod = 'COD' | 'aba_payway';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'CANCELLED';
export type ContactMethod = 'PHONE CALL' | 'TELEGRAM';

// Type for raw ABA PayWay response data
export interface IPaywayResponseData {
  status?: number | string;
  apv?: string;
  payment_status_code?: number;
  data?: {
    apv?: string;
    payment_status_code?: number;
    payment_status: string;
  };
  status_info?: {
    code?: string;
    message?: string;
  };
  [key: string]: string | number | object | undefined; // Strictly typed dictionary instead of any
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: IProductImage;
  code?: string;
};

export interface IPayWayData {
  tran_id: string;
}

export interface ICustomer {
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  preferredContactMethod: ContactMethod;
}

export interface IShippingAddress {
  firstName?: string;
  lastName?: string;
  phoneNumber: string,
  street: string;
  province: string;
  commune?: string;
  district?: string;
}

export interface IOrder {
  tran_id: string;
  userId: Types.ObjectId | null;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number,
  amount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  apv?: string | null;
  rawPaywayResponse?: IPaywayResponseData;
}

// Strictly type the express request body
export interface ICreateOrderRequestBody {
  cartItems: Array<{ productId: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
}

export interface IPaywayData {
  req_time: string;
  merchant_id: string;
  tran_id: string;
  amount: string;
  payment_option: string;
  hash: string;
  firstname: string;
  lastname: string;
  phone: string;
  currency: string;
  type: string;
};

export type CreateOrderRequest = Request<Record<string, unknown>, unknown, ICreateOrderRequestBody>;