import { defineStore } from 'pinia';
import api from '@/composables/useFetch';
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import type { ICart, ICartRespone } from '@/types/cart';

const TOTAL_ITEMS_STORAGE_KEY = 'cart:totalItems';

const readStoredTotalItems = (): number => {
  const raw = localStorage.getItem(TOTAL_ITEMS_STORAGE_KEY);
  const parsed = raw !== null ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useCartStore = defineStore('cart', () => {
  const cart = ref<ICart | null>(null);
  const loading = ref<boolean>(false);
  const getCartLoadingg = ref<boolean>(false);
  const updateCartLoading = ref<boolean>(false);
  const removeCartLoading = ref<boolean>(false);
  const error = ref<string>('');
  const storedTotalItems = ref<number>(readStoredTotalItems());
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const cartItems = computed(() => cart.value?.items || []);

  const totalItems = computed(() =>
    cart.value
      ? cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
      : storedTotalItems.value,
  );

  watch(
    totalItems,
    (value) => {
      storedTotalItems.value = value;
      localStorage.setItem(TOTAL_ITEMS_STORAGE_KEY, String(value));
    },
    { immediate: true },
  );

  const amount = computed(() =>
    cartItems.value.reduce((sum, item) => {
      const price = item.productId.price || 0;
      return sum + price * item.quantity;
    }, 0),
  );

  const fetchCart = async (forceRefresh: boolean = false) => {
    if (cart.value && !forceRefresh ) {
      return { success: true, cart: cart.value };
    }
    getCartLoadingg.value = true;
    error.value = '';
    try {
      const { data } = await api.get<ICartRespone>('/carts');
      cart.value =  data.data.cart;
      await delay(500);
      return true;
    } catch {
      cart.value = null;
      return false;
    } finally {
      getCartLoadingg.value = false;
    }
  };

  const addToCart = async(productId: string, quantity: number = 1, selectedAttributes: Record<string, string> = {}) => {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.post<ICartRespone>(`/carts/add/${productId}`, {
        quantity,
        selectedAttributes,
      });
      cart.value = data.data.cart;
      await delay(500);
      return { success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Fail to Add item to cart.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const updateCartItem = async (itemId: string, payload: { quantity?: number; selectedAttributes?: Record<string, string> }) => {
    updateCartLoading.value = true;
    error.value = '';
    try {
      const { data } = await api.patch<ICartRespone>(`/carts/item/${itemId}`, payload);
      cart.value = data.data.cart;
      await delay(500);
      return { success: true };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Fail to Update item to cart.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      updateCartLoading.value = false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    removeCartLoading.value = true;
    error.value = '';
    try {
      const { data } = await api.delete<ICartRespone>(`/carts/item/${itemId}`);
      cart.value = data.data.cart;
      await delay(500);
      return { success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Fail to Delete item to cart.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      removeCartLoading.value = false;
    }
  };

  const clearCartState = () => {
    cart.value = null;
    storedTotalItems.value = 0;
    localStorage.removeItem(TOTAL_ITEMS_STORAGE_KEY);
    error.value = '';
  };

  return {
    cart,
    loading,
    error,
    cartItems,
    totalItems,
    amount,
    getCartLoadingg,
    updateCartLoading,
    removeCartLoading,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCartState,
    updateCartItem,
  };
});

