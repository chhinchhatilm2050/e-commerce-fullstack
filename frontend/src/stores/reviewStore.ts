import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type { IReview, IReviewRespone } from '@/types/review.js';
import type { IPagination } from '@/types/product';

export const useReviewStore = defineStore('reviews', () => {
  const reviews = ref<IReview[]>([]);
  const reviewPagination = ref<IPagination | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string>('');

  const cacheMap = ref<Map<string, { reviews: IReview[]; pagination: IPagination }>>(new Map());
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchReview = async(id: string, page: number) => {
    const cacheKey = `${id}_page_${page}`;
    if (cacheMap.value.has(cacheKey)) {
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
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to fetch reviews.'
        : 'Failed to fetch reviews.';
      reviews.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteReview = async(reviewId: string) => {
    loading.value = true;
    error.value = '';

    try {
      await api.delete(`/reviews/${reviewId}`);
      reviews.value = reviews.value.filter((r) => r._id !== reviewId);
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to delete review.'
        : 'Failed to delete review.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    reviewPagination,
    reviews,
    fetchReview,
    deleteReview,
  };
});
