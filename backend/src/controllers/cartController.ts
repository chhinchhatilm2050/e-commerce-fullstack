import CartModel from '../model/cart.js';
import AppError from '../utils/appError.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { IAddToCartBody, IAddToCartParams, IMergeGuestCartRequest } from '../interface/cart.js';
import { Types } from 'mongoose';

export const getCart = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const cart = await CartModel.findOne({userId}).populate({
    path: 'items.productId',
    select: {
      name: 1,
      price: 1,
      stock: 1,
      specification: 1,
      code: 1,
      images: { $slice: 1 }
    }
  });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  };

  res.status(200).json({
    success: true,
    data: { cart }
  });

});

export const addToCart = asyncHandler(
  async (req: Request<IAddToCartParams, unknown, IAddToCartBody>, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { selectedAttributes = {}, quantity = 1 } = req.body;

    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }

    // 1. Get existing cart or create a new one
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
    }
    const normalizeAttrs = (attrs: Map<string, string> | Record<string, unknown> | undefined): string => {
      const obj: Record<string, unknown> = attrs instanceof Map ? Object.fromEntries(attrs) : (attrs ?? {});

      return JSON.stringify(
        Object.keys(obj)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = obj[key];
            return acc;
          }, {}),
      );
    };
    // 2. Convert incoming attributes to a simple string for easy comparison
    const targetString = normalizeAttrs(selectedAttributes);
    // 3. Find matching item in cart
    const existingItem = cart.items.find((item) => {
      const isSameProduct = item.productId.toString() === productId.toString();

      const itemAttrsObj = item.selectedAttributes instanceof Map
        ? Object.fromEntries(item.selectedAttributes)
        : item.selectedAttributes || {};

      const isSameAttributes = normalizeAttrs(itemAttrsObj) === targetString;

      return isSameProduct && isSameAttributes;
    });

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.unshift({
        productId: new Types.ObjectId(productId),
        selectedAttributes: new Map(Object.entries(selectedAttributes)),
        quantity: Number(quantity),
      });
    }
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: {
        name: 1,
        price: 1, 
        images: { $slice: 1},
        stock: 1,
        code: 1,
        specification:1 
      },
    });

    res.status(200).json({
      success: true,
      data: { cart },
    });
  }
);

export const updateCartItem = asyncHandler(
  async (
    req: Request<IAddToCartParams, unknown, IAddToCartBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user?._id;
    const { itemId } = req.params;
    const { quantity, selectedAttributes } = req.body;

    const cart = await CartModel.findOne({ userId });
    if (!cart) return next(new AppError('Cart not found', 404));

    const itemIndex = cart.items.findIndex((i) => i._id?.toString() === itemId);
    if (itemIndex === -1) return next(new AppError('Item not found in cart', 404));

    if (quantity !== undefined) {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    if (selectedAttributes !== undefined) {
      cart.items[itemIndex].selectedAttributes = new Map(
        Object.entries(selectedAttributes)
      );
    }

    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name price images stock specification',
  
    });

    res.status(200).json({
      success: true,
      data: { cart },
    });
  }
);

export const removeCartItem = asyncHandler(async(req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { itemId } = req.params;

  const cart = await CartModel.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: itemId}}},
    { new: true }
  ).populate({ path: 'items.productId', select: 'name price images stock specification' });

  res.status(200).json({
    success: true,
    data: { cart },
  });
});

export const mergeGuestCart = asyncHandler(async(req: Request<unknown, unknown, IMergeGuestCartRequest>, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?._id;
  const { guestItems } = req.body;
  
  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    const cart = await CartModel.findOne({ userId }).populate('items.productId');
    res.status(200).json({ success: true, cart });
    return;
  };

  let cart = await CartModel.findOne({ userId });
  if (!cart) cart = new CartModel({ userId, items: [] });
  for (const gItem of guestItems) {
    const gAttrs = new Map(Object.entries(gItem.selectedAttributes || {}));
      
    const existingItem = cart.items.find((item) => {
      if (item.productId.toString() !== gItem.productId.toString()) return false;
      const itemAttrs = item.selectedAttributes || new Map();
      if (itemAttrs.size !== gAttrs.size) return false;
      for (const [k, v] of gAttrs.entries()) {
        if (itemAttrs.get(k) !== v) return false;
      }
      return true;
    });

    if (existingItem) {
      existingItem.quantity += gItem.quantity;
    } else {
      cart.items.push({
        productId: gItem.productId,
        selectedAttributes: gAttrs,
        quantity: gItem.quantity,
      });
    }
  }
  await cart.save();
  res.status(200).json({
    success: true, 
    data: { cart }
  });
});