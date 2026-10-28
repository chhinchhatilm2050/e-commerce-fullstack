import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IUserResponse, IUserStats, User } from '@/types/user';
import api from '@/composables/useFetch.js'; 
import axios from 'axios';
import type { IPagination } from '@/types/user';

export const useUserAdminStore = defineStore('adminUser', () => {
  const loading = ref<boolean>(false);
  const updateUserLoading = ref<boolean>(false);
  const statusCardLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const users = ref<User[]>([]);
  const pageCache = ref<Map<string, { data: User[]; pagination: IPagination }>>(new Map());
  const pagination = ref<IPagination | null>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchUsers = async (params: Record<string, number | string> = {}, forceRefresh = false) => {
    const cacheKey = JSON.stringify(params);
    if (!forceRefresh && pageCache.value.has(cacheKey)) {
      const cached = pageCache.value.get(cacheKey)!;
      users.value = cached.data;
      pagination.value = cached.pagination;
      return;
    }
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await api.get<IUserResponse>('/users', { params });
      await delay(300);
      users.value = data.data.users;
      pagination.value = data.pagination;

      pageCache.value.set(cacheKey, {
        data: users.value,
        pagination: pagination.value,
      });
      return { success: true };
    } catch (err) {
      users.value = [];
      pagination.value = null;
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to fetch users') : 'An unexpected error occurred.';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const updateUserStatus = async (id: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    updateUserLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ message: string, success: boolean }>(`/users/${id}/status`, { status: newStatus });
      
      if (data.success) {
        const user = users.value.find(u => u._id === id);
        if (user) {
          user.status = newStatus;
        }
      }
      return data;
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Update user status fail.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      updateUserLoading.value = false;
    }
  };

  const userStatus = ref<IUserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
  });

  const getUserStatus = async () => {
    statusCardLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get('/users/status');
      await delay(300);
      const responseData = data?.data || data;

      if (responseData) {
        const statsArray: Array<{ _id: string; count: number }> = responseData.stats || [];

        // Map array items into specific status counts
        const activeUser = statsArray.find((s) => s._id === 'active');
        const inActiveUser = statsArray.find((s) => s._id === 'inactive');
        const blockedUser = statsArray.find((s) => s._id === 'blocked');

        userStatus.value = {
          total: responseData.total || 0,
          active: activeUser ? activeUser.count : 0,
          inactive: inActiveUser ? inActiveUser.count : 0,
          blocked: blockedUser ? blockedUser.count : 0,
        };
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to fetch order status statistics'
        : 'Failed to fetch order status statistics';
      error.value = message;
    } finally {
      statusCardLoading.value = false;
    }
  };

  const clearCache = () => {
    pageCache.value.clear();
    pagination.value = null;
  };

  return {
    loading,
    statusCardLoading,
    updateUserLoading,
    error,
    users,
    pagination,
    userStatus,
    fetchUsers,
    updateUserStatus,
    getUserStatus,
    clearCache,
  };
});

