export interface IAnalyticsRespone {
  success: boolean;
  data: IAnalylices
}

export interface IAnalylices {
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
