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
  const [lowStockCount, outOfStockCount, outOfStockProducts, lowStockProducts, recentUsers, recentProducts] = await Promise.all([
    ProductModel.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
    ProductModel.countDocuments({ $or: [{ stock: { $lte: 0 } }, { status: 'out_of_stock' }] }),
    ProductModel.find({ $or: [{ stock: { $lte: 0 } }, { status: 'out_of_stock' }] })
      .select('name stock status images createdAt')
      .sort({ stock: 1, createdAt: -1 })
      .limit(5),
    ProductModel.find({
      stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
      status: { $ne: 'out_of_stock' },
    })
      .select('name stock status images createdAt')
      .sort({ stock: 1, createdAt: -1 })
      .limit(5),
    UserModel.find({ role: 'customer' })
      .select('firstName lastName email avatar status createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    ProductModel.find()
      .select('name stock price status images createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

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
      outOfStockCount,
      outOfStockProducts,
      lowStockProducts,
      recentUsers,
      recentProducts,
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

interface BusinessReportAggregations {
  summary: Array<{
    totalOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    refundedAmount: number;
  }>;
  paid: Array<{ revenue: number; orders: number }>;
  pending: Array<{ revenue: number; orders: number }>;
  timeline: Array<{ _id: number; revenue: number; orders: number }>;
  statuses: Array<{ _id: string; count: number }>;
  paymentMethods: Array<{ _id: string; revenue: number; orders: number }>;
  topProducts: Array<{ _id: string; unitsSold: number; revenue: number }>;
}

export const getBusinessReport = asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period;
  const yearValue = req.query.year;
  const monthValue = req.query.month;
  const currentYear = new Date().getUTCFullYear();

  if (
    (period !== 'month' && period !== 'year')
    || typeof yearValue !== 'string'
    || !/^\d{4}$/.test(yearValue)
    || Number(yearValue) < 2000
    || Number(yearValue) > currentYear
    || (period === 'month' && (
      typeof monthValue !== 'string'
      || !/^(?:[1-9]|1[0-2])$/.test(monthValue)
    ))
  ) {
    res.status(400).json({ success: false, message: 'A valid report period, year, and month are required.' });
    return;
  }

  const year = Number(yearValue);
  const month = period === 'month' ? Number(monthValue) : undefined;
  const startDate = month
    ? new Date(Date.UTC(year, month - 1, 1))
    : new Date(Date.UTC(year, 0, 1));
  const endDate = month
    ? new Date(Date.UTC(year, month, 1))
    : new Date(Date.UTC(year + 1, 0, 1));

  const [aggregated, newCustomers] = await Promise.all([
    OrderModel.aggregate<BusinessReportAggregations>([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
                refundedOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'REFUNDED'] }, 1, 0] } },
                refundedAmount: {
                  $sum: { $cond: [{ $eq: ['$paymentStatus', 'REFUNDED'] }, '$amount', 0] },
                },
              },
            },
          ],
          paid: [
            { $match: paidRevenueFilter },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                orders: { $sum: 1 },
              },
            },
          ],
          pending: [
            { $match: pendingRevenueFilter },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                orders: { $sum: 1 },
              },
            },
          ],
          timeline: [
            { $match: paidRevenueFilter },
            {
              $group: {
                _id: month ? { $dayOfMonth: '$createdAt' } : { $month: '$createdAt' },
                revenue: { $sum: '$amount' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          statuses: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          paymentMethods: [
            { $match: paidRevenueFilter },
            {
              $group: {
                _id: '$paymentMethod',
                revenue: { $sum: '$amount' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
          ],
          topProducts: [
            { $match: paidRevenueFilter },
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.name',
                unitsSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
              },
            },
            { $sort: { unitsSold: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]),
    UserModel.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate, $lt: endDate },
    }),
  ]);

  const result = aggregated[0];
  const summary = result?.summary[0];
  const paid = result?.paid[0];
  const pending = result?.pending[0];
  const bucketCount = month
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 12;
  const timelineByBucket = new Map((result?.timeline ?? []).map((item) => [item._id, item]));
  const timeline = Array.from({ length: bucketCount }, (_, index) => {
    const bucket = index + 1;
    const value = timelineByBucket.get(bucket);
    return {
      label: month ? String(bucket) : new Date(Date.UTC(year, index, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
      revenue: value?.revenue ?? 0,
      orders: value?.orders ?? 0,
    };
  });
  const revenue = paid?.revenue ?? 0;
  const paidOrders = paid?.orders ?? 0;

  res.status(200).json({
    success: true,
    data: {
      period,
      year,
      month,
      summary: {
        totalOrders: summary?.totalOrders ?? 0,
        paidOrders,
        paidRevenue: revenue,
        averageOrderValue: paidOrders ? revenue / paidOrders : 0,
        pendingOrders: pending?.orders ?? 0,
        pendingRevenue: pending?.revenue ?? 0,
        cancelledOrders: summary?.cancelledOrders ?? 0,
        refundedOrders: summary?.refundedOrders ?? 0,
        refundedAmount: summary?.refundedAmount ?? 0,
        newCustomers,
      },
      timeline,
      orderStatuses: result?.statuses ?? [],
      paymentMethods: result?.paymentMethods ?? [],
      topProducts: result?.topProducts ?? [],
    },
  });
});