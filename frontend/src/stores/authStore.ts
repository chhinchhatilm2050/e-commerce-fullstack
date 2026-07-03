import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { RegisterPayload, RegisterResponse, User, AuthResponse } from '@/types/auth.js';
import { getAccessToken, setAccessToken, clearToken } from '@/composables/useLocalStorage.js';

export const useAuthStore = defineStore('auth', () => {
  const authError = ref<string>('');
  const verifyErro = ref<string>('');
  const loading = ref<boolean>(false);
  const emailLoading = ref<boolean>(false);
  const verifyLoading = ref<boolean>(false);
  const resetLoading = ref<boolean>(false);
  const token = ref<string | null>(getAccessToken());
  const currentUser = ref<User | null>(null);

  const setToken = (newToekn: string | null) => {
    token.value = newToekn;
  };

  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  const register = async(payload: RegisterPayload): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<RegisterResponse>('/auth/register', payload);
      return { success: true, message: data.message };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          const message = data.errors[0].message; 
          await delay(1500);
          authError.value = message;
          return { success: false, message };
        }
        const message = data?.message ?? 'Registration failed.';
        await delay(1500);
        authError.value = message;
        return { success: false, message };
      }
      await delay(1500);
      authError.value = 'An unexpected error occurred.';
      return { success: false, message: 'An unexpected error occurred.' };
    } finally {
      loading.value = false;
    }
  };

  const login = async(email: string, password: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      await delay(1500);
      token.value = data.accessToken;
      currentUser.value = data.user;
      setAccessToken(data.accessToken);
      return { success: true, message: data.message };
    } catch (err) {
      const message =  axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Invalid email or password.') : 'An unexpected error occurred.';
      await delay(1500);
      authError.value = message;
      loading.value = false;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const fetchMe = async(): Promise<void> => {
    const { data } = await api.get('/auth/me');
    currentUser.value = data.data;
  };

  const verifiEmail = async(email: string, code: string): Promise<{success: boolean; message: string}> => {
    emailLoading.value = true;
    verifyErro.value = '';
    try {
      const { data } = await api.post<{message: string}>('/auth/verify-email', { email, code });
      await delay(1500);
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      await delay(1500);
      verifyErro.value = message;
      return { success: false, message };
    } finally {
      emailLoading.value = false;
    }
  };

  const logout = async (): Promise<{ success: boolean, message: string }>  => {
    loading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post('/auth/logout');
      await delay(1500);
      currentUser.value = null;
      token.value = null;
      clearToken();
      return { success: true, message: data.message };
    } catch (err) {
      await delay(1500);
      return { success: false, message: err as string };
    } finally {
      loading.value = false;
    }
  };

  const forgetPasword = async(email: string): Promise<{success: boolean; message: string}> => {
    loading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<{message: string}>('/auth/forget-password', { email });
      await delay(1500);
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to send password reset email.') : 'An unexpected error occurred.';
      await delay(1500);
      authError.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const verifyResetCode = async(email: string, code: string): Promise<{success: boolean; message: string; resetToken?: string}> => {
    verifyLoading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<{message: string; resetToken?: string}>('/auth/verify-reset-code', { email, code });
      await delay(1500);
      return { success: true, message: data.message, resetToken: data.resetToken };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Invalid reset code.') : 'An unexpected error occurred.';
      await delay(1500);
      authError.value = message;
      return { success: false, message };
    } finally {
      verifyLoading.value = false;
    }
  };

  const resetPassword = async(email: string, resetToken: string, newPassword: string): Promise<{success: boolean; message: string}> => {
    resetLoading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<{message: string}>('/auth/reset-password', { email, resetToken, password: newPassword });
      await delay(1500);
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to reset password.') : 'An unexpected error occurred.';
      await delay(1500);
      authError.value = message;
      return { success: false, message };
    } finally {
      resetLoading.value = false;
    } 
  };

  return {
    authError, loading, token, isAdmin, isLoggedIn, currentUser, verifyErro, emailLoading, verifyLoading, resetLoading,
    register, verifiEmail, login,  logout, setToken, fetchMe, forgetPasword, verifyResetCode,
    resetPassword,
  };
});
