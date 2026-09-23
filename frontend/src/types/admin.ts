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
};

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
