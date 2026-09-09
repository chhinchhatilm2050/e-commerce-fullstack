import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch.js';
import axios from 'axios';
import type { IAddress, IAddressPayload, IAddressResponse } from '@/types/address';
import type { IAddRespone } from '@/types/wishlist';

export const useAddressStore = defineStore('address', () => { 
  const loading = ref(false);
  const error = ref<string | null>(null);
  const address = ref<IAddress | null>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchMyAddress = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<IAddressResponse>('/addresses/me');
      address.value = data.data.address;
      return { success: true, message: data.message };
    } catch {
      address.value = null;
    } finally {
      loading.value = false;
    }
  };

  const saveMyAddress = async (newAddress: IAddressPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<IAddRespone>('/addresses/me', newAddress);
      await delay(800);
      await fetchMyAddress();
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to save address.' : 'Failed to save address.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const deleteMyAddress = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<IAddressResponse>('/addresses/me');
      address.value = null;
      return { success: true, message: data.message };
    } catch (err) { 
      const message = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete address.' : 'Failed to delete address.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    address,
    fetchMyAddress,
    saveMyAddress,
    deleteMyAddress,
  };
});

