import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { RegisterPayload, RegisterResponse, User, LoginPayload, AuthResponse, MeResponse } from '@/types/auth.js';
import { getAccessToken, setAccessToken, clearToken } from '@/composables/useLocalStorage.js';

export const useAuthStore = defineStore('auth', () => {
  const authError = ref<string>('');
  const verifyErro = ref<string>('');
  const loading = ref<boolean>(false);
  const token = ref<string | null>(getAccessToken());
  const currentUser = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  const login = async(payload: LoginPayload): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    authError.value = '';
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      token.value = data.token;
      setAccessToken(data.token);
      return { success: true, message: data.message };
    } catch (err) {
      const message =  axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Invalid email or password.') : 'An unexpected error occurred.';
      authError.value = message;
      return { success: false, message };
    }
  };

  const fetchProfile = async(): Promise<boolean> => {
    if (!token.value) return false;
    loading.value = true;
    try {
      const { data } = await api.get<MeResponse>('/user/me');
      currentUser.value = data.data.user;
      return true;
    } catch (err) {
      authError.value = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Session expired. Please log in again.') : 'Session expired. Please log in again.';
      logout();
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async(payload: RegisterPayload): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    authError.value = '';
    await new Promise(r => setTimeout(r, 1000));
    try {
      const { data } = await api.post<RegisterResponse>('/users/register', payload);
      return { success: true, message: data.message };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          const message = data.errors[0].message; 
          authError.value = message;
          return { success: false, message };
        }
        const message = data?.message ?? 'Registration failed.';
        authError.value = message;
        return { success: false, message };
      }
      authError.value = 'An unexpected error occurred.';
      return { success: false, message: 'An unexpected error occurred.' };
    } finally {
      loading.value = false;
    }
  };

  const verifiEmail = async(email: string, code: string): Promise<{success: boolean; message: string}> => {
    loading.value = true;
    verifyErro.value = '';
    try {
      const { data } = await api.post<{message: string}>('/users/verify-email', { email, code });
      return { success: true, message: data.message };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      verifyErro.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const logout = (): void => {
    currentUser.value = null;
    token.value = null;
    clearToken();
  };

  return {
    authError, loading, token, isAdmin, isLoggedIn, currentUser, verifyErro,
    register, verifiEmail, login,fetchProfile, logout,
  };
});
