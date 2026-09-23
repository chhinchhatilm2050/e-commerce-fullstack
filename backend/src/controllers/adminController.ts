import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import OrderModel from '../model/order.js';
import UserModel from '../model/user.js';
import ProductModel from '../model/product.js';

interface RevenueAggregationResult {
  _id: null;
  total: number;
}

interface MonthlyRevenueAggregation {
  _id: number;
  totalRevenue: number;
  totalOrders: number;
}

interface TopProductAggregation {
  _id: string;
  totalSold: number;
}

export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfThisMonth = new Date(currentYear, now.getMonth(), 1);
  const startOfLastMonth = new Date(currentYear, now.getMonth() - 1, 1);

  // 1. Fetch Revenue for Current Month
  const currentMonthRevenue = await OrderModel.aggregate<RevenueAggregationResult>([
    { $match: { status: 'APPROVED', createdAt: {$gte: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // 2. Fetch Revenue for Last Month
  const lastMonthRevenue = await OrderModel.aggregate<RevenueAggregationResult>([
    { $match: { status: 'APPROVED', createdAt: { $gte: startOfLastMonth,$lt: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // 3. Fetch Total Revenue for the Entire Current Year
  const yearlyRevenue = await OrderModel.aggregate<RevenueAggregationResult>([
    {
      $match: {
        status: 'APPROVED',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
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

  const LOW_STOCK_THRESHOLD: number = 10;
  const lowStockCount = await ProductModel.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } });

  // Basic totals
  const totalOrders = await OrderModel.countDocuments();
  const pendingOrders = await OrderModel.countDocuments({ status: 'PENDING' });
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

  // 1. Monthly Approved Revenue & Approved Order Counts
  const approvedAggregation = await OrderModel.aggregate<MonthlyRevenueAggregation>([
    {
      $match: {
        status: 'APPROVED',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 }       
      }     
    },     
    {
      $sort: { '_id': 1 } 
    }
  ]);

  // 2. Monthly Pending Order Counts
  const pendingAggregation = await OrderModel.aggregate<MonthlyRevenueAggregation>([
    {
      $match: {
        status: 'PENDING',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 }       
      }     
    },     
    {$sort: { '_id': 1 } }
  ]);

  const monthlySales: number[] = Array<number>(12).fill(0);
  const monthlyOrders: number[] = Array<number>(12).fill(0);
  const monthlyPending: number[] = Array<number>(12).fill(0);
  const monthlyPendingRevenue: number[] = Array<number>(12).fill(0);

  approvedAggregation.forEach((item) => {
    monthlySales[item._id - 1] = item.totalRevenue;
    monthlyOrders[item._id - 1] = item.totalOrders;
  });

  pendingAggregation.forEach((item) => {
    monthlyPending[item._id - 1] = item.totalOrders;
    monthlyPendingRevenue[item._id -1] = item.totalRevenue;
  });

  // 3. Top Selling Products
  const topProducts = await OrderModel.aggregate<TopProductAggregation>([
    { $match: { status: 'APPROVED' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' }
      }
    },
    { 
      $sort: { totalSold: -1 } 
    },     
    {
      $limit: 5 
    }
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