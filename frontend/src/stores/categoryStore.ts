import { defineStore } from 'pinia';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import { ref } from 'vue';
import type { ICategory, ICategoryListResponse, ICategorySingleResponse } from '@/types/category';

export const useCategoryStore = defineStore('category', () => {
  const topLevelCategories = ref<ICategory[]>([]);
  const currentCategory = ref<ICategory | null>(null);
  const subcategories = ref<ICategory[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string>('');
  let fetchPromise: Promise<boolean> | null = null;
  
  const fetchTopLevelCategories = async () => {
    if (topLevelCategories.value.length > 0) return true;
    if (fetchPromise) return fetchPromise;
    loading.value = true;
    error.value = '';
    fetchPromise = (async () => {
      try {
        const { data } = await api.get<ICategoryListResponse>('/categories/top-level');
        topLevelCategories.value = data.data.categories;
        return true;
      } catch (err) {
        error.value = axios.isAxiosError(err)
          ? err.response?.data?.message ?? 'Failed to load categories'
          : 'Failed to load categories';
        return false;
      } finally {
        loading.value = false;
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  };

  const fetchCategoryBySlug = async (slug: string) => {
    loading.value = true; 
    error.value = '';
    try {
      const { data } = await api.get<ICategorySingleResponse>(`/categories/${slug}`);
      currentCategory.value = data.data;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Category not found' : 'Category not found';
      currentCategory.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryChildren = async (slug: string) => {
    try {
      const { data } = await api.get<ICategoryListResponse>(`/categories/${slug}/children`);
      subcategories.value = data.data.categories;
      return true;
    } catch {
      subcategories.value = [];
      return false;
    }
  };

  return {
    topLevelCategories,
    currentCategory,
    subcategories,
    loading,
    error,
    fetchCategoryBySlug,
    fetchCategoryChildren,
    fetchTopLevelCategories,
  };
});

