import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch.js';
import axios from 'axios';
import type {
  IAnalytics,
  IAnalyticsResponse,
  IBusinessReport,
  IBusinessReportParams,
  IBusinessReportResponse,
  ISalesChartData,
  ISalesChartReq,
} from '@/types/admin';

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false);
  const chartsLoading = ref(false);
  const reportLoading = ref(false);
  const reportError = ref<string | null>(null);
  const error = ref<string | null>(null);
  const analyticsData = ref<IAnalytics | null>(null);
  const chartsData = ref<ISalesChartData | null>(null);
  const businessReport = ref<IBusinessReport | null>(null);

  const getAnalyticsData = async () => {
    try {
      loading.value = true;
      error.value = null;
      const { data } = await api.get<IAnalyticsResponse>('/admin/analytics');
      analyticsData.value = data.data;
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

  const getBusinessReport = async (params: IBusinessReportParams) => {
    try {
      reportLoading.value = true;
      reportError.value = null;
      const { data } = await api.get<IBusinessReportResponse>('/admin/business-report', { params });
      businessReport.value = data.data;
      return { success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to load business report.')
        : 'An unexpected error occurred while loading the business report.';
      reportError.value = message;
      return { success: false, message };
    } finally {
      reportLoading.value = false;
    }
  };

  return {
    getAnalyticsData,
    getSalesChartsData,
    getBusinessReport,
    chartsData,
    analyticsData,
    businessReport,
    loading,
    chartsLoading,
    reportLoading,
    reportError,
    error,
  };
});
