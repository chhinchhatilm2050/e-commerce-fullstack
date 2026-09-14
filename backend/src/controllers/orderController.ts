import OrderModel from '../model/order.js';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import type { IOrder, IOrderItem, IPayWayData, IPaywayResponseData } from '../interface/iorder.js';
import {
  getPaywayReqTime,
  generatePurchaseHash,
  generateCheckStatusHash,
  getPaywayCheckTransactionUrl,
  getPaywayPurchaseUrl,
} from '../utils/payway.js';
import type { IPaywayPurchaseParams } from '../utils/payway.js';
import ProductModel from '../model/product.js';
import axios from 'axios';
import FormData from 'form-data';

export const createOrder = asyncHandler(async (req: Request<unknown, unknown, IOrder>, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?._id ?? null;

  if (!req.body) {
    throw new AppError('Request body is missing', 400);
  }

  const {
    items,
    paymentMethod,
    customer,
    shippingAddress,
    deliveryFee= 1.00,
  } = req.body;

  if (!paymentMethod) {
    throw new AppError('paymentMethod is required', 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Cart items are required and must be an array', 400);
  }

  const productIds = items.map((item) => item.productId);
  const dbProducts = await ProductModel.find({ _id: { $in: productIds } });
  let subtotal = 0;
  let discountAmount = 0;

  if (dbProducts.length !== items.length) {
    throw new AppError('One or more products were not found', 404);
  }

  for (const item of items) {
    const product = dbProducts.find((p) => String(p._id) === String(item.productId))!;
    if ((product.stock ?? 0) < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.name}". Only ${product.stock ?? 0} left.`, 400);
    }
  }

  const itemSnapshots: IOrderItem[] = items.map((item): IOrderItem => {
    const product = dbProducts.find(
      (p) => String(p._id) === String(item.productId)
    )!;

    const comparePrice = product.comparePrice ?? product.price;
    const price = product.price;

    subtotal += comparePrice * item.quantity;
    discountAmount += (comparePrice - price) * item.quantity;

    return {
      productId: String(product._id),
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0] ?? '',
      code: product.code,
    };
  });

  const finalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
  const tran_id = `ORD-${Date.now()}`;

  const newOrder = await OrderModel.create({
    tran_id,
    userId,
    items: itemSnapshots,
    subtotal,
    discountAmount,
    deliveryFee,
    amount: finalAmount,
    paymentMethod,
    status: 'PENDING',
    customer,
    shippingAddress,
  });

  if (paymentMethod === 'COD') {
    await ProductModel.bulkWrite(
      itemSnapshots.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        },
      }))
    );

    res.status(201).json({
      success: true,
      paymentMethod: 'COD',
      message: 'Order placed successfully.',
      order: newOrder,
    });
    return;
  }

  if (paymentMethod === 'aba_payway') {
    const req_time = getPaywayReqTime();
    const merchant_id = process.env.PAYWAY_MERCHANT_ID ?? '';
    const apiKey = process.env.PAYWAY_API_KEY ?? '';

    const paywayParams: IPaywayPurchaseParams = {
      req_time,
      merchant_id,
      tran_id,
      amount: (finalAmount).toFixed(2),
      items: '',
      // // PayWay rejects an empty shipping field with "Wrong shipping price" (code 10).
      // // It must be a valid numeric string, even when there's no delivery fee.
      shipping: Number(deliveryFee).toFixed(2),
      firstname: customer?.firstName ?? '',
      lastname: customer?.lastName ?? '',
      email: '',
      phone: customer?.phoneNumber ?? '',
      type: 'purchase',
      payment_option: 'abapay_khqr',
      return_url: '',
      cancel_url: '',
      continue_success_url: '',
      return_deeplink: '',
      currency: 'USD',
      custom_fields: '',
      return_params: '',
      payout: '',
      lifetime: '',
      additional_params: '',
      google_pay_token: '',
      skip_success_page: '',
    };

    const hash = generatePurchaseHash(paywayParams, apiKey);

    // NOTE: We still return the signed payload to the client here so the
    // checkout UI can render/redirect immediately. However, createPaywayPurchase
    // below no longer trusts this payload blindly - it re-derives everything
    // from the DB record and re-signs it server-side, so any client-side
    // tampering or accidental re-serialization of these values cannot produce
    // a payload that reaches PayWay unchecked.
    res.status(201).json({
      success: true,
      paymentMethod: 'aba_payway',
      orderId: newOrder._id,
      paywayData: {
        ...paywayParams,
        hash,
      },
    });
    return;
  }

  throw new AppError('Invalid payment method provided', 400);
});

export const checkOrderStatus = asyncHandler(async (req: Request<{ tran_id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { tran_id } = req.params;
  const order = await OrderModel.findOne({ tran_id });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentMethod === 'COD' || order.status === 'APPROVED') {
    res.status(200).json({
      success: true,
      status: order.status,
      order,
    });
    return;
  }

  const req_time = getPaywayReqTime();
  const merchant_id = process.env.PAYWAY_MERCHANT_ID ?? '';
  const apiKey = process.env.PAYWAY_API_KEY ?? '';

  // FIX: built via the shared helper so this can never drift into a doubled/
  // malformed URL relative to the purchase endpoint (see payway.ts). Also
  // uses "check-transaction-2", the correct current endpoint - the old
  // "check-transaction" path 404s, and since the catch block below treats a
  // 404 as "still pending", the order silently never updated.
  const paywayUrl = getPaywayCheckTransactionUrl();

  const hash = generateCheckStatusHash(req_time, merchant_id, tran_id, apiKey);

  // FIX: check-transaction-2 expects a JSON body, not multipart/form-data
  // (multipart is only for the purchase endpoint).
  const payload = { req_time, merchant_id, tran_id, hash };

  try {
    const response = await axios.post<IPaywayResponseData>(
      paywayUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const resData = response.data;
    // IMPORTANT: `status.code === '00'` means "the API request succeeded" -
    // it is present on nearly every valid response, including ones for a
    // transaction that's still pending. It must NOT be used to decide
    // payment success. Only `data.payment_status_code` / `data.payment_status`
    // reflect the actual payment outcome.
    const isSuccess =
      resData?.data?.payment_status_code === 0 ||
      resData?.data?.payment_status === 'APPROVED';

    // Only mark FAILED on an explicit failure/decline signal from PayWay.
    // Treat any other/unrecognized code as still pending rather than assuming
    // failure - we'd rather keep polling than wrongly fail a real payment.
    const status = String(resData?.data?.payment_status ?? '').toUpperCase();
    const isFailed = ['FAILED', 'DECLINED', 'CANCELLED', 'CANCELED', 'EXPIRED'].includes(status);

    if (isSuccess) {
      order.status = 'APPROVED';
      order.apv = resData.data?.apv ?? null;
      order.rawPaywayResponse = resData;
      await order.save();

      // FIX: this was completely missing. Stock for aba_payway orders is
      // only decremented here, the moment payment is actually confirmed -
      // not when the order/QR was first created. The early-return check
      // above (order.status === 'APPROVED' -> short-circuit) means this
      // block only ever runs once per order, so this can't double-decrement
      // on repeated polls.
      await ProductModel.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: -item.quantity } },
          },
        }))
      );
    } else if (isFailed) {
      order.status = 'FAILED';
      order.rawPaywayResponse = resData;
      await order.save();
    }
    // else: still pending (or unrecognized) - leave order.status untouched
    // and let the client keep polling.

    res.status(200).json({
      success: true,
      status: order.status,
      paywayRaw: resData,
    });
  } catch (error) {
    // FIX: previously, any error other than a 404 fell through this catch
    // block with no response sent at all, leaving the client request hanging
    // until timeout and bypassing the global error handler (since asyncHandler
    // never saw the error). Every branch now either sends a response or
    // forwards to next().
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(200).json({
        success: true,
        status: 'PENDING',
        message: 'Transaction not yet initialized on PayWay',
      });
      return;
    }

    console.error(
      'PayWay check-status error:',
      axios.isAxiosError(error) ? error.response?.data ?? error.message : error
    );
    next(new AppError('Failed to check PayWay transaction status', 502));
  }
});

export const createPaywayPurchase = asyncHandler(async (req: Request<unknown, unknown, { tran_id: string, paywayData: IPayWayData }>, res: Response, next: NextFunction): Promise<void> => {
  // FIX: previously this endpoint forwarded whatever payload the client sent
  // (including a client-supplied hash) straight to PayWay. That has two
  // problems: (1) any re-serialization of the payload on the frontend (e.g.
  // number <-> string coercion of `amount`) silently invalidates the hash,
  // and (2) nothing stops a client from tampering with amount/tran_id before
  // resubmitting.
  //
  // Instead, we only trust the tran_id from the client, look up the
  // authoritative order record, and rebuild + re-sign the PayWay payload
  // from server-side data. This guarantees the hash always matches what
  // PayWay expects and that the amount charged is the one we calculated.
  const tran_id: string | undefined = req.body?.tran_id ?? req.body?.paywayData?.tran_id;

  if (!tran_id) {
    return next(new AppError('tran_id is required', 400));
  }

  const order = await OrderModel.findOne({ tran_id });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentMethod !== 'aba_payway') {
    return next(new AppError('Order was not created for aba_payway', 400));
  }

  if (order.status === 'APPROVED') {
    return next(new AppError('Order has already been paid', 400));
  }

  const req_time = getPaywayReqTime();
  const merchant_id = process.env.PAYWAY_MERCHANT_ID ?? '';
  const apiKey = process.env.PAYWAY_API_KEY ?? '';

  // FIX: `order.amount` already includes deliveryFee (subtotal - discount +
  // deliveryFee). PayWay computes the actual charged total as amount + shipping,
  // so sending the full order.amount here AND the deliveryFee again in
  // `shipping` double-charges the delivery fee (this was the $1 mismatch
  // between the modal's displayed total and the amount scanned on the QR).
  // `amount` must be the items-only total; `shipping` carries the fee once.
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const itemsAmount = Math.max(0, Number(order.amount) - deliveryFee);

  const paywayParams: IPaywayPurchaseParams = {
    req_time,
    merchant_id,
    tran_id: order.tran_id,
    amount: itemsAmount.toFixed(2),
    items: '',
    shipping: deliveryFee.toFixed(2),
    firstname: order.customer?.firstName ?? '',
    lastname: order.customer?.lastName ?? '',
    email: '',
    phone: order.customer?.phoneNumber ?? '',
    type: 'purchase',
    payment_option: 'abapay_khqr',
    return_url: '',
    cancel_url: '',
    continue_success_url: '',
    return_deeplink: '',
    currency: 'USD',
    custom_fields: '',
    return_params: '',
    payout: '',
    lifetime: '',
    additional_params: '',
    google_pay_token: '',
    skip_success_page: '',
  };

  const hash = generatePurchaseHash(paywayParams, apiKey);

  const keys: (keyof IPaywayPurchaseParams)[] = [
    'req_time',
    'merchant_id',
    'tran_id',
    'amount',
    'items',
    'shipping',
    'firstname',
    'lastname',
    'email',
    'phone',
    'type',
    'payment_option',
    'return_url',
    'cancel_url',
    'continue_success_url',
    'return_deeplink',
    'currency',
    'custom_fields',
    'return_params',
    'payout',
    'lifetime',
    'additional_params',
    'google_pay_token',
    'skip_success_page',
  ];

  const formData = new FormData();
  keys.forEach((key) => {
    const val = paywayParams[key];
    formData.append(key, val !== undefined && val !== null ? String(val) : '');
  });
  formData.append('hash', hash);

  try {
    const paywayUrl = getPaywayPurchaseUrl();

    const response = await axios.post<string>(paywayUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const err = error as import('axios').AxiosError<{ message?: string }>;
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to request KHQR from PayWay',
    });
  }
});