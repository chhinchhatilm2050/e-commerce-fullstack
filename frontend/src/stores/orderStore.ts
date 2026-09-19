import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch';
import axios from 'axios';
import type { ICheckoutPayload, IOrder, IOrderDetailRes, IOrderRespone, IPaywayData } from '@/types/iorder';

export const useOrderStore = defineStore('order', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const orders = ref<IOrder[]>([]);
  const currentOrder = ref<IOrder | null>(null);
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
    loading.value = true;
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
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    orders,
    currentOrder,
    placeOrder,
    checkStatus,
    createPaywayPurchase,
    fetchMyorder,
    fetchOrderDetail,
  };
});

