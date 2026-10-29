import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IUserResponse, IUserStats, SingleUserResponse, User } from '@/types/user';
import api from '@/composables/useFetch.js'; 
import axios from 'axios';
import type { IPagination } from '@/types/user';

export const useUserAdminStore = defineStore('adminUser', () => {
  const loading = ref<boolean>(false);
  const updateUserLoading = ref<boolean>(false);
  const statusCardLoading = ref<boolean>(false);
  const deleteUserLoading = ref<boolean>(false);
  const userDetailLoading = ref<boolean>(false);
  const promoteUserLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
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

  const fetchUserById = async (id: string): Promise<boolean> => {
    userDetailLoading.value = true;
    error.value = null;
    selectedUser.value = null;

    try {
      const { data } = await api.get<SingleUserResponse>(`/users/${id}`);
      selectedUser.value = data.data.user;
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to fetch user details.')
        : 'An unexpected error occurred.';
      error.value = message;
      return false;
    } finally {
      userDetailLoading.value = false;
    }
  };

  const promoteUser = async (id: string) => {
    promoteUserLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ success: boolean; data: { user: User } }>(`/users/${id}/promote`);
      await delay(300);

      if (!data.success) {
        const message = 'Failed to promote user to admin.';
        error.value = message;
        return { success: false, message };
      }

      if (selectedUser.value?._id === id) {
        selectedUser.value.role = data.data.user.role;
      }

      const listedUser = users.value.find((user) => user._id === id);
      if (listedUser) {
        listedUser.role = data.data.user.role;
      }

      for (const cachedPage of pageCache.value.values()) {
        const cachedUser = cachedPage.data.find((user) => user._id === id);
        if (cachedUser) {
          cachedUser.role = data.data.user.role;
        }
      }

      return { success: true, message: 'User promoted to admin successfully.' };
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Failed to promote user to admin.')
        : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      promoteUserLoading.value = false;
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

  const deleteUser = async (id: string) => {
    deleteUserLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<{message: string, success: boolean}>(`/users/${id}`);
      await delay(300);
      
      users.value = users.value.filter((u) => u._id !== id);
      
      clearCache();
      
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      deleteUserLoading.value = false;
    }
  };

  const deleteUserPermanently = async (id: string) => {
    deleteUserLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<{ message: string, success: boolean }>(`/users/${id}/permanent`);
      await delay(300);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      deleteUserLoading.value = false;
    }
  };

  const restoreUser = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ message: string, success: boolean }>(`/users/${id}/restore`);
      await delay(300);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
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
    deleteUserLoading,
    userDetailLoading,
    promoteUserLoading,
    error,
    users,
    selectedUser,
    pagination,
    userStatus,
    fetchUsers,
    updateUserStatus,
    fetchUserById,
    promoteUser,
    getUserStatus,
    deleteUser,
    deleteUserPermanently,
    restoreUser,
    clearCache,
  };
});
