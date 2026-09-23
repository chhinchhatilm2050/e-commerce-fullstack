import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch.js';
import axios from 'axios';
import type { IAnalylices, IAnalyticsRespone, ISalesChartData, ISalesChartReq } from '@/types/admin';

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false);
  const chartsLoading = ref(false);
  const error = ref<string | null>(null);
  const analylicesData = ref<IAnalylices | null>(null);
  const chartsData = ref<ISalesChartData | null>(null);

  const getAnalyticsData = async () => {
    try {
      loading.value = true;
      error.value = null;
      const { data } = await api.get<IAnalyticsRespone>('/admin/analytics');
      analylicesData.value = data.data;
      return { success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to load analytics.')
        : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const getSalesChartsData = async () => {
    try {
      chartsLoading.value = true;
      const { data } = await api.get<ISalesChartReq>('/admin/charts-data');
      chartsData.value = data.data;
      return { success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to load analytics.')
        : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      chartsLoading.value = false;
    }
  };

  return {
    getAnalyticsData,
    getSalesChartsData,
    chartsData,
    analylicesData,
    loading,
    chartsLoading,
    error,
  };
});

