import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch';
import axios from 'axios';
import type { ICheckoutPayload, IOrder,IOrderStatusStats, IOrderDetailRes, IOrderRespone, IPaywayData, IAdminOrdersResponse } from '@/types/iorder';
import type { IPagination } from '@/types/iorder';

export const useOrderStore = defineStore('order', () => {
  const loading = ref(false);
  const orderDetailLoading = ref<boolean>(false);
  const deleteOrderLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const orders = ref<IOrder[]>([]);
  const adminOrders = ref<IOrder[]>([]);
  const currentOrder = ref<IOrder | null>(null);
  const pagination = ref<IPagination | null>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const placeOrder = async (payload: ICheckoutPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/orders/create', payload);
      await delay(800);
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to place order'
        : 'Failed to place order';

      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const checkStatus = async (tranId: string) => {
    try {
      const response = await api.get(`/orders/check-status/${tranId}`);
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to check order status'
        : 'Failed to check order status';

      error.value = message;
    }
  };

  // Dedicated action for Proxying PayWay KHQR Request
  const createPaywayPurchase = async (paywayData: IPaywayData) => {
    loading.value = true;
    error.value = null;
    try {
      // using auth headers automatically
      const response = await api.post('/orders/payway-purchase', paywayData);
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to generate KHQR code'
        : 'Failed to generate KHQR code';

      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMyorder = async() => {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.get<IOrderRespone>('/orders/my-orders');
      orders.value = data.data.orders;
      return true;
    } catch {
      orders.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchOrderDetail = async (id: string) => {
    orderDetailLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<IOrderDetailRes>(`/orders/my-orders/${id}`);
      currentOrder.value = data.data.order;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to fetch order detail'
        : 'Failed to fetch order detail';
      error.value = message;
    } finally {
      orderDetailLoading.value = false;
    }
  };

  const cancelOrder = async(id: string | null ): Promise<{success: boolean;
     message: string}> => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<IOrderRespone>(`/orders/cancel/${id}`);
      orders.value = data.data.orders;
      return { success: data.success, message: data.message };
    } catch (err) {
      orders.value = [];
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to Cancel order'
        : 'Failed to Cancel order';
      error.value = message;
      return message;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllOrdersAdmin = async (params?: Record<string, string | number>) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<IAdminOrdersResponse>('/orders/admin/all', { params });
      await delay(300);  
      adminOrders.value = data.data.orders;
      pagination.value = data.pagination;
      return data;
    } catch (err) {
      adminOrders.value = [];
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to fetch admin orders'
        : 'Failed to fetch admin orders';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (
    id: string,
    payload: { status?: string; paymentStatus?: string } | string,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Normalize payload if caller passes just a status string
      const body = typeof payload === 'string' ? { status: payload } : payload;

      const response = await api.patch(`/orders/status/${id}`, body);
      const updatedOrder = response.data.data.order;

      // Update local admin orders list
      const index = adminOrders.value.findIndex(
        (o) => o._id === id || o.tran_id === id,
      );
      if (index !== -1) {
        adminOrders.value[index] = updatedOrder;
      }

      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to update order status'
        : 'Failed to update order status';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async(id: string | null, tranId: string | null) => {
    deleteOrderLoading.value = true;
    error.value = null;
    try {
      const ids = id || tranId;
      const { data } = await api.delete(`/orders/${ids}`);
      await delay(500);
      return { success: data.success, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to delete order'
        : 'Failed to fetch delete order';
      error.value = message;
    } finally {
      deleteOrderLoading.value = false;
    }
  };

  const orderStatusStats = ref<IOrderStatusStats>({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const getOrderStatus = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get('/orders/order-status');
      const responseData = data?.data || data;

      if (responseData) {
        const statsArray: Array<{ _id: string; count: number }> = responseData.stats || [];

        // Map array items into specific status counts
        const pendingItem = statsArray.find((s) => s._id === 'PENDING');
        const shippedItem = statsArray.find((s) => s._id === 'SHIPPED');
        const deliveredItem = statsArray.find((s) => s._id === 'DELIVERED');
        const cancelledItem = statsArray.find((s) => s._id === 'CANCELLED');

        orderStatusStats.value = {
          total: responseData.total || 0,
          pending: pendingItem ? pendingItem.count : 0,
          shipped: shippedItem ? shippedItem.count : 0,
          delivered: deliveredItem ? deliveredItem.count : 0,
          cancelled: cancelledItem ? cancelledItem.count : 0,
        };
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to fetch order status statistics'
        : 'Failed to fetch order status statistics';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    orders,
    currentOrder,
    pagination,
    adminOrders,
    orderStatusStats,
    orderDetailLoading,
    deleteOrderLoading,
    placeOrder,
    checkStatus,
    createPaywayPurchase,
    fetchMyorder,
    fetchOrderDetail,
    cancelOrder,
    fetchAllOrdersAdmin,
    updateOrderStatus,
    getOrderStatus,
    deleteOrder,
  };
});

