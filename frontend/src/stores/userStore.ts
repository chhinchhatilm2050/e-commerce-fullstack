import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { User, MeResponse, UpdateProfilePayload, UpdateProfileRequest } from '@/types/user.js';
import { useAuthStore } from './authStore.js';

export const useUserStore = defineStore('user', () => {
  const userError = ref<string>('');
  const loading = ref<boolean>(false);
  const currentUser = ref<User | null>(null);
  const authStore = useAuthStore();
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const fetchProfile = async(): Promise<boolean> => {
    if (!authStore.token) return false;
    loading.value = true;
    try {
      const { data } = await api.get<MeResponse>('/users/me');
      currentUser.value = data.data.user;
      return true;
    } catch (err) {
      userError.value = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Session expired. Please log in again.') : 'Session expired. Please log in again.';
      authStore.logout();
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateMyProfile = async (payload: UpdateProfileRequest): Promise<{success: boolean; message: string}> => {
    loading.value = true;
    userError.value = '';
    try {
      const { data } = await api.patch<UpdateProfilePayload>('users/me', payload);
      await delay(1500);
      currentUser.value = data.data.user;
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to update profile.') : 'An unexpected error occurred.';
      await delay(1500);
      userError.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }; 

  return { 
    fetchProfile,
    updateMyProfile,
    currentUser,
    userError,
    loading,
  };
});
