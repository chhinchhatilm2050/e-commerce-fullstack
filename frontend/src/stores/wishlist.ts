import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { IAddRespone, IDeleteRespone, IWishlistItem, IWishlistResponse } from '@/types/wishlist';

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<IWishlistItem[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string>('');

  const wishlistedIds = computed(() => new Set(items.value.map(item => item?.productId?._id)));
  const isWishlisted = (productId: string): boolean => wishlistedIds.value.has(productId);
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const wishlistCount = computed<number>(() => items.value.length);
  const itemsCache = ref<IWishlistItem[]>([]);

  const fetchWishlist = async (): Promise<boolean> => {
    if (itemsCache.value.length > 0) {
      loading.value = true;
      items.value = itemsCache.value;
      await delay(300);
      loading.value = false;
      return true;
    }
    loading.value = true;
    error.value = '';

    try {
      const { data } = await api.get<IWishlistResponse>('/wishlists');
      await delay(300);
      items.value = data.data.wishlist;
      itemsCache.value = data.data.wishlist;
      return true;
    } catch {
      items.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const toggleWishlist = async (productId: string) => {
    loading.value = true;
    error.value = '';
    const exists = isWishlisted(productId);

    try {
      if (exists) {
        const { data } = await api.delete<IDeleteRespone>(`/wishlists/${productId}`);
        items.value = items.value.filter((item) => item?.productId?._id !== productId);
        await delay(300);
        return { success: data.success, message: data.message };
      } else {
        const { data } = await api.post<IAddRespone>(`/wishlists/${productId}`);
        await delay(300);
        if (data.populated) {
          items.value.push(data.populated);
        }
        return { success: data.success, message: data.message };
      }
    } catch (err) {
      const fallback = exists ? 'Fail to delete item.' : 'Fail to add item.';
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const clearWishlist = (): void => {
    items.value = [];
    itemsCache.value = [];
  };

  return {
    items,
    loading,
    error,
    itemsCache,
    isWishlisted,
    wishlistCount,
    fetchWishlist,
    toggleWishlist,
    clearWishlist,
  };
});
