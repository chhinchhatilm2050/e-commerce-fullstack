import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, clearToken } from '@/composables/useLocalStorage.js';
import router from '@/router/index.js';

export const API_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000/api';

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  accessToken: string
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post<RefreshResponse>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);

      } catch (refreshError) {
        clearToken();
        router.push('/');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
