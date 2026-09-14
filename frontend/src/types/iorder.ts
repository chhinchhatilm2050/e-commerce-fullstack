export interface IOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface ICheckoutPayload {
  items: IOrderItemPayload[];
  paymentMethod: 'aba_payway' | 'COD';
  customer: {
    phoneNumber: string;
    preferredContactMethod: 'PHONE CALL' | 'TELEGRAM';
  };
  shippingAddress: {
    province: string;
    district: string;
    commune: string;
    streetAddress?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    street: string;
  };
  deliveryFee: number;
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

export interface IOrder {
  tran_id: string;
  amount: string;
  status: string;
}

