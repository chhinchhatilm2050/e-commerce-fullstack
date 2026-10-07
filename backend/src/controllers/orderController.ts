import OrderModel from '../model/order.js';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import type { IOrder, IOrderItem, IOrderQuery, IPayWayData, IPaywayResponseData, OrderStatus, PaymentStatus } from '../interface/iorder.js';
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
import QueryBuilder from '../utils/queryBuilder.js';

// 1. CREATE ORDER (CUSTOMER)

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
    deliveryFee,
  } = req.body;

  if (!paymentMethod) {
    throw new AppError('paymentMethod is required', 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Cart items are required and must be an array', 400);
  }

  const uniqueProductIds = [...new Set(items.map((item) => String(item.productId)))];

  // 2. Fetch unique products from database
  const dbProducts = await ProductModel.find({ _id: { $in: uniqueProductIds } });

  // 3. Verify all unique products exist
  if (dbProducts.length !== uniqueProductIds.length) {
    throw new AppError('One or more products were not found', 404);
  }

  // 4. Calculate total requested quantity per product ID across all variants
  const requestedQuantities = items.reduce<Record<string, number>>((acc, item) => {
    const pId = String(item.productId);
    acc[pId] = (acc[pId] || 0) + item.quantity;
    return acc;
  }, {});

  // 5. Verify sufficient stock against combined requested quantities
  for (const product of dbProducts) {
    const totalRequested = requestedQuantities[String(product._id)] || 0;
    const availableStock = product.stock ?? 0;

    if (availableStock < totalRequested) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Requested: ${totalRequested}, Available: ${availableStock}.`,
        400
      );
    }
  }
  let subtotal = 0;
  let discountAmount = 0;

  // Check stock availability
  for (const item of items) {
    const product = dbProducts.find((p) => String(p._id) === String(item.productId))!;
    if ((product.stock ?? 0) < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.name}". Only ${product.stock ?? 0} left.`, 400);
    }
  }

  const itemSnapshots: IOrderItem[] = items.map((item): IOrderItem => {
    const product = dbProducts.find((p) => String(p._id) === String(item.productId))!;

    const price = product.price;
    const comparePrice = Math.max(product.comparePrice ?? price, price);

    subtotal += comparePrice * item.quantity;

    const itemDiscount = Math.max(0, comparePrice - price);
    discountAmount += itemDiscount * item.quantity;

    return {
      productId: String(product._id),
      name: product.name,
      price: product.price,
      size: item.size,
      color: item.color,
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
    paymentStatus: 'UNPAID', // Default payment state
    status: 'PENDING',        // Default order fulfillment state
    customer,
    shippingAddress,
  });

  if (paymentMethod === 'COD') {
    // Reserve stock immediately for COD
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

// 2. CHECK ABA PAYWAY TRANSACTION STATUS

export const checkOrderStatus = asyncHandler(async (req: Request<{ tran_id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { tran_id } = req.params;
  const order = await OrderModel.findOne({ tran_id, isDeleted: { $ne: true } });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentMethod === 'COD' || order.paymentStatus === 'PAID') {
    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus,
      status: order.status,
      order,
    });
    return;
  }

  const req_time = getPaywayReqTime();
  const merchant_id = process.env.PAYWAY_MERCHANT_ID ?? '';
  const apiKey = process.env.PAYWAY_API_KEY ?? '';
  const paywayUrl = getPaywayCheckTransactionUrl();
  const hash = generateCheckStatusHash(req_time, merchant_id, tran_id, apiKey);

  const payload = { req_time, merchant_id, tran_id, hash };

  try {
    const response = await axios.post<IPaywayResponseData>(paywayUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const resData = response.data;
    const isSuccess =
      resData?.data?.payment_status_code === 0 ||
      resData?.data?.payment_status === 'APPROVED';

    const rawStatus = String(resData?.data?.payment_status ?? '').toUpperCase();
    const isFailed = ['FAILED', 'DECLINED', 'CANCELLED', 'CANCELED', 'EXPIRED'].includes(rawStatus);

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.apv = resData.data?.apv ?? null;
      order.rawPaywayResponse = resData;
      await order.save();

      // Deduct stock once ABA payment completes
      await ProductModel.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: -item.quantity } },
          },
        }))
      );
    } else if (isFailed) {
      order.paymentStatus = 'FAILED';
      order.status = 'CANCELLED';
      order.rawPaywayResponse = resData;
      await order.save();
    }

    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus,
      status: order.status,
      paywayRaw: resData,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(200).json({
        success: true,
        paymentStatus: 'UNPAID',
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

// 3. GENERATE PAYWAY KHQR PURCHASE PAYLOAD

export const createPaywayPurchase = asyncHandler(async (req: Request<unknown, unknown, { tran_id: string, paywayData: IPayWayData }>, res: Response, next: NextFunction): Promise<void> => {
  const tran_id: string | undefined = req.body?.tran_id ?? req.body?.paywayData?.tran_id;

  if (!tran_id) {
    return next(new AppError('tran_id is required', 400));
  }

  const order = await OrderModel.findOne({ tran_id, isDeleted: { $ne: true } });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentMethod !== 'aba_payway') {
    return next(new AppError('Order was not created for aba_payway', 400));
  }

  if (order.paymentStatus === 'PAID') {
    return next(new AppError('Order has already been paid', 400));
  }

  const req_time = getPaywayReqTime();
  const merchant_id = process.env.PAYWAY_MERCHANT_ID ?? '';
  const apiKey = process.env.PAYWAY_API_KEY ?? '';

  const deliveryFee = Number(order.deliveryFee ?? 0);
  const itemsAmount = Math.max(0, Number(order.amount));

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

  const formData = new FormData();
  Object.entries(paywayParams).forEach(([key, val]) => {
    formData.append(key, val !== undefined && val !== null ? String(val) : '');
  });
  formData.append('hash', hash);

  try {
    const paywayUrl = getPaywayPurchaseUrl();
    const response = await axios.post<string>(paywayUrl, formData, {
      headers: { ...formData.getHeaders() },
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

// 4. CUSTOMER ORDER QUERIES

export const getMyOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const orders = await OrderModel.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: { orders },
  });
});

export const getOrderDetail = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { id } = req.params;
  const filter = id
    ? { _id: id, userId }
    : { tran_id: id, userId };

  const order = await OrderModel.findOne(filter).lean();

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

// 5. ADMIN: GET ALL ORDERS WITH FILTERS

export const getAllOrdersAdmin = asyncHandler(async (req: Request<unknown, unknown, unknown, IOrderQuery>,res: Response,_next: NextFunction): Promise<void> => {
  const queryParams = { ...req.query } as Record<string, unknown>;
  // Always exclude soft-deleted records
  // Handle custom date/transaction search logic before passing to QueryBuilder
  if (req.query.search) {
    const searchTerm = String(req.query.search);
    const searchRegex = { $regex: searchTerm, $options: 'i' };
    const searchDate = new Date(searchTerm);
    const isDateValid = !isNaN(searchDate.getTime());

    const orConditions: Record<string, unknown>[] = [{ tran_id: searchRegex }];

    if (isDateValid) {
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      orConditions.push({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    }

    queryParams.$or = orConditions;
    delete queryParams.search; // Remove raw search key so QueryBuilder doesn't attempt redundant exact matching
  }

  // Execute using QueryBuilder
  const result = await new QueryBuilder(OrderModel, queryParams, { isAdmin: true, allowedStatuses: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], defaultStatus: 'PENDING' })
    .filter()
    .sort()
    .paginate()
    .select(
      'tran_id customer.firstName paymentStatus items.name items.image createdAt totalAmount amount status'
    )
    .execute();

  // Disable browser caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: { orders: result.data },
    pagination: result.pagination,
  });
});

// 6. ADMIN: UPDATE LOGISTICS & PAYMENT STATUS

export const updateOrderStatus = asyncHandler(async (req: Request<{ id: string }, unknown, { status?: OrderStatus; paymentStatus?: PaymentStatus }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const filter = id ? { _id: id } : { tran_id: id };

  const order = await OrderModel.findOne(filter);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (status) {
    order.status = status ;
  }

  // When admin marks COD order as DELIVERED, automatically set paymentStatus to PAID
  if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
    order.paymentStatus = 'PAID';
  } else if (paymentStatus) {
    order.paymentStatus = paymentStatus ;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: { order },
  });
});

// 7. CANCEL ORDER (ADMIN & CUSTOMER)

export const cancelOrder = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const filter = id ? { _id: id } : { tran_id: id };

  const order = await OrderModel.findOne(filter);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status === 'CANCELLED') {
    return next(new AppError('Order is already cancelled', 400));
  }

  if (order.status === 'DELIVERED') {
    return next(new AppError('Cannot cancel an order that has already been delivered', 400));
  }

  // Restock inventory if stock was previously deducted (COD or Paid ABA)
  const shouldRestock = order.paymentMethod === 'COD' || order.paymentStatus === 'PAID';
  if (shouldRestock) {
    await ProductModel.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: item.quantity } },
        },
      }))
    );
  }

  order.status = 'CANCELLED';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully and stock restored.',
    data: { order },
  });
});

// 8. SOFT DELETE ORDER (ADMIN)

export const deleteOrder = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const filter = id ? { _id: id } : { tran_id: id };

  const order = await OrderModel.findOneAndUpdate(
    filter,
    { isDeleted: true },
    { new: true }
  );

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Order removed from active list.',
  });
});

export const getOrderStats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const stats = await OrderModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await OrderModel.countDocuments({ isDeleted: false });

  res.status(200).json({
    success: true,
    data: {
      total,
      stats,
    },
  });
});