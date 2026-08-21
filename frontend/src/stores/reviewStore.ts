import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { ICreateReview, IDeleteReview, IReview, IReviewRespone, IUpdateReview } from '@/types/review.js';
import type { IPagination } from '@/types/product';

export const useReviewStore = defineStore('reviews', () => {
  const reviews = ref<IReview[]>([]);
  const reviewPagination = ref<IPagination | null>(null);
  const loading = ref<boolean>(false);
  const deleteLoding = ref<boolean>(false);
  const error = ref<string>('');

  const cacheMap = ref<Map<string, { reviews: IReview[]; pagination: IPagination }>>(new Map());
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchReview = async(id: string, page: number, forceFetch = false) => {
    const cacheKey = `${id}_page_${page}`;

    if (!forceFetch && cacheMap.value.has(cacheKey)) {
      loading.value = true;
      const cached = cacheMap.value.get(cacheKey)!;
      reviews.value = cached.reviews;
      reviewPagination.value = cached.pagination;
      await delay(250);
      loading.value = false;
      return true;
    }

    loading.value = true;
    error.value = '';

    try {
      const { data } = await api.get<IReviewRespone>(`/reviews/${id}`, {
        params: { page },
      });
      reviews.value = data.data.reviews;
      reviewPagination.value = data.data.pagination;

      cacheMap.value.set(cacheKey, {
        reviews: data.data.reviews,
        pagination: data.data.pagination,
      });

      return true;
    } catch {
      reviews.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const createReview = async(payload: ICreateReview): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    error.value = '';

    try {
      const formData = new FormData();
      formData.append('rating', String(payload.rating));
      formData.append('comment', payload.comment);
      if (payload.images && payload.images.length > 0 ) {
        payload.images.forEach((file) => {
          formData.append('images', file);
        });
      };
      const { data } = await api.post<IReviewRespone>(`/reviews/${payload.productId}`, formData);
      reviews.value = data.data.reviews;
      cacheMap.value.clear();
      return { success: true, message: data.message };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          const message = data.errors[0].message;
          await delay(1500);
          error.value = message;
          return { success: false, message };
        }
        const message = data?.message ?? 'Failed to create review.';
        await delay(1500);
        error.value = message;
        return { success: false, message };
      }
      await delay(1500);
      error.value = 'An unexpected error occurred.';
      return { success: false, message: 'An unexpected error occurred.' };
    } finally {
      loading.value = false;
    }
  };

  const deleteReview = async(reviewId: string) => {
    deleteLoding.value = true;
    error.value = '';

    try {
      const { data } = await api.delete<IDeleteReview>(`/reviews/${reviewId}`);
      await delay(1500);
      reviews.value = reviews.value.filter((r) => r._id !== reviewId);
      cacheMap.value.clear();
      return { success: data.success, message: data.message };
    } catch (err) {
      const message =  axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Fail to delete review.') : 'An unexpected error occurred.';
      error.value = message;
      deleteLoding.value = false;
      return { success: false, message };
    } finally {
      deleteLoding.value = false;
    }
  };

  const updateReview = async(reviewId: string, payload: IUpdateReview) => {
    loading.value = true;
    error.value = '';

    try {
      const formData = new FormData();
      if (payload.rating !== undefined) {
        formData.append('rating', payload.rating.toString());
      };

      if (payload.comment) {
        formData.append('comment', payload.comment);
      };

      if (payload.removeImageIds && payload.removeImageIds.length > 0) {
        payload.removeImageIds.forEach((id) => {
          formData.append('removeImageIds', id);
        });
      };

      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file) => {
          formData.append('images', file);
        });
      };

      const { data } = await api.put<IDeleteReview>(`/reviews/${reviewId}`, formData);
      return { success: data.message, message: data.message };
    } catch (err) {
      const message =  axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Fail to edit review.') : 'An unexpected error occurred.';
      error.value = message;
      loading.value = false;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    reviewPagination,
    reviews,
    deleteLoding,
    fetchReview,
    deleteReview,
    createReview,
    updateReview,
  };
});
