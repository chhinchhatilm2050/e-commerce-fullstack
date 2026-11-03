export interface IAnalyticsResponse {
  success: boolean;
  data: IAnalytics;
}

export interface IAnalytics {
  totalRevenue: number,
  totalOrders: number,
  pendingOrders: number,
  totalCustomers: number,
  revenueGrowth?: number;
  lowStockCount: number;
  outOfStockCount: number;
  outOfStockProducts: IDashboardProduct[];
  lowStockProducts: IDashboardProduct[];
  recentUsers: IDashboardUser[];
  recentProducts: IDashboardProduct[];
};

export interface IDashboardProduct {
  _id: string;
  name: string;
  stock: number;
  status: string;
  price?: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  createdAt: string;
}

export interface IDashboardUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  status: string;
  createdAt: string;
}

export interface ISalesChartData {
  monthlySales: number[];
  monthlyOrders: number[];
  monthlyPending: number[];
  monthlyPendingRevenue: number[];
  topProducts: {
    names: string[];
    counts: number[];
  };
};

export interface ISalesChartReq {
  success: boolean,
  data: ISalesChartData
}

export type BusinessReportPeriod = 'month' | 'year';

export interface IBusinessReportParams {
  period: BusinessReportPeriod;
  year: number;
  month?: number;
}

export interface IBusinessReport {
  period: BusinessReportPeriod;
  year: number;
  month?: number;
  summary: {
    totalOrders: number;
    paidOrders: number;
    paidRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    pendingRevenue: number;
    cancelledOrders: number;
    refundedOrders: number;
    refundedAmount: number;
    newCustomers: number;
  };
  timeline: Array<{ label: string; revenue: number; orders: number }>;
  orderStatuses: Array<{ _id: string; count: number }>;
  paymentMethods: Array<{ _id: string; revenue: number; orders: number }>;
  topProducts: Array<{ _id: string; unitsSold: number; revenue: number }>;
}

export interface IBusinessReportResponse {
  success: boolean;
  data: IBusinessReport;
}
