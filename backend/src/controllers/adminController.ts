import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import OrderModel from '../model/order.js';
import UserModel from '../model/user.js';
import ProductModel from '../model/product.js';

// Revenue Filter: Money collected via ABA PayWay OR Cash on Delivery upon delivery
const paidRevenueFilter = {
  status: { $ne: 'CANCELLED' },
  $or: [
    { paymentStatus: 'PAID' },
    { paymentMethod: 'COD', status: 'DELIVERED' }
  ]
};

// Pending Filter: Unpaid orders or COD orders still in transit/pending
const pendingRevenueFilter = {
  status: { $in: ['PENDING', 'SHIPPED'] as const },
  paymentStatus: { $ne: 'PAID' as const },
  $nor: [{ paymentMethod: 'COD' as const, status: 'DELIVERED' as const }]
};
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfThisMonth = new Date(currentYear, now.getMonth(), 1);
  const startOfLastMonth = new Date(currentYear, now.getMonth() - 1, 1);

  // 1. Fetch Revenue for Current Month
  const currentMonthRevenue = await OrderModel.aggregate<{total: number}>([
    { $match: { ...paidRevenueFilter, createdAt: { $gte: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // 2. Fetch Revenue for Last Month
  const lastMonthRevenue = await OrderModel.aggregate<{total: number}>([
    { $match: { ...paidRevenueFilter, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // 3. Fetch Total Revenue for Current Year
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  const yearlyRevenue = await OrderModel.aggregate<{total: number}>([
    {
      $match: {
        ...paidRevenueFilter,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const currentTotal = currentMonthRevenue[0]?.total ?? 0;
  const lastTotal = lastMonthRevenue[0]?.total ?? 0;
  const totalYearlyRevenue = yearlyRevenue[0]?.total ?? 0;

  // 4. Calculate Percentage Growth
  let revenueGrowth = 0;
  if (lastTotal > 0) {
    revenueGrowth = Math.round(((currentTotal - lastTotal) / lastTotal) * 100);
  } else if (currentTotal > 0) {
    revenueGrowth = 100;
  }

  const LOW_STOCK_THRESHOLD = 10;
  const lowStockCount = await ProductModel.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } });

  // Counts
  const totalOrders = await OrderModel.countDocuments({ status: { $ne: 'CANCELLED' } });
  const pendingOrders = await OrderModel.countDocuments(pendingRevenueFilter);
  const totalCustomers = await UserModel.countDocuments({ role: 'customer' });

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: totalYearlyRevenue,
      currentMonthRevenue: currentTotal,
      totalOrders,
      pendingOrders,
      totalCustomers,
      revenueGrowth,
      lowStockCount,
    }
  });
});

export const getSalesChartsData = asyncHandler(async (req: Request, res: Response) => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  // 1. Monthly Paid Revenue & Order Volume
  const paidAggregation = await OrderModel.aggregate([
    {
      $match: {
        ...paidRevenueFilter,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // 2. Monthly Pending Revenue & Order Volume
  const pendingAggregation = await OrderModel.aggregate([
    {
      $match: {
        ...pendingRevenueFilter,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const monthlySales: number[] = Array<number>(12).fill(0);
  const monthlyOrders: number[] = Array<number>(12).fill(0);
  const monthlyPending: number[] = Array<number>(12).fill(0);
  const monthlyPendingRevenue: number[] = Array<number>(12).fill(0);

  interface MonthlyAggregateItem {
  _id: number;
  totalRevenue: number;
  totalOrders: number;
}

  paidAggregation.forEach((item: MonthlyAggregateItem) => {
    monthlySales[item._id - 1] = item.totalRevenue;
    monthlyOrders[item._id - 1] = item.totalOrders;
  });

  pendingAggregation.forEach((item: MonthlyAggregateItem) => {
    monthlyPending[item._id - 1] = item.totalOrders;
    monthlyPendingRevenue[item._id - 1] = item.totalRevenue;
  });

  // 3. Top Selling Products (From completed/paid sales)
  const topProducts = await OrderModel.aggregate<{_id: number, totalSold: number}>([
    { $match: paidRevenueFilter },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthlySales,
      monthlyOrders,
      monthlyPending,
      monthlyPendingRevenue,
      topProducts: {
        names: topProducts.map((p) => p._id),
        counts: topProducts.map((p) => p.totalSold)
      }
    }
  });
});