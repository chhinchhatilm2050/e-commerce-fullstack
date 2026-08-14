import { defineStore } from 'pinia';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import { ref } from 'vue';
import type {
  ICategory,
  ICategoryListChildrenResponse,
  ICategoryListResponse,
  ICategoryListSiblingsResponse,
  ICategorySingleResponse,
} from '@/types/category';

export const useCategoryStore = defineStore('category', () => {
  const topLevelCategories = ref<ICategory[]>([]);
  const currentCategory = ref<ICategory | null>(null);
  const subcategories = ref<ICategory[]>([]);

  const loading = ref<boolean>(false);
  const error = ref<string>('');

  const categoryCache = ref<Record<string, ICategory>>({});
  const childrenCache = ref<Record<string, ICategory[]>>({});
  const siblingsCache = ref<Record<string, ICategory[]>>({});

  let topLevelPromise: Promise<boolean> | null = null;

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchTopLevelCategories = async () => {
    if (topLevelCategories.value.length > 0) return true;
    if (topLevelPromise) return topLevelPromise;

    loading.value = true;
    error.value = '';

    topLevelPromise = (async () => {
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
        topLevelPromise = null;
      }
    })();

    return topLevelPromise;
  };

  const fetchCategoryBySlug = async (slug: string) => {
    if (categoryCache.value[slug]) {
      loading.value = true;
      currentCategory.value = categoryCache.value[slug];
      await delay(250);
      loading.value = false;
      return true;
    }

    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.get<ICategorySingleResponse>(`/categories/${slug}`);
      const category = data.data.category;
      currentCategory.value = category;
      categoryCache.value[slug] = category;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Category not found'
        : 'Category not found';
      currentCategory.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryChildren = async (slug: string) => {
    if (childrenCache.value[slug]) {
      const cachedChildren = childrenCache.value[slug];

      if (cachedChildren.length === 0) {
        return await fetchCategorySiblings(slug);
      }

      subcategories.value = cachedChildren;
      return true;
    }

    loading.value = true;
    try {
      const { data } = await api.get<ICategoryListChildrenResponse>(`/categories/${slug}/children`);
      const children = data.data.children;
      // Always save to cache so we remember we checked this slug
      childrenCache.value[slug] = children;

      if (children.length > 0) {
        subcategories.value = children;
        return true;
      } else {
        return await fetchCategorySiblings(slug);
      }
    } catch {
      subcategories.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategorySiblings = async (slug: string) => {
    if (siblingsCache.value[slug]) {
      subcategories.value = siblingsCache.value[slug];
      return true;
    }
    loading.value = true;

    try {
      const { data } = await api.get<ICategoryListSiblingsResponse>(`/categories/${slug}/siblings`);
      subcategories.value = data.data.siblings;
      siblingsCache.value[slug] = data.data.siblings;
      return true;
    } catch {
      subcategories.value = [];
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    categoryCache.value = {};
    childrenCache.value = {};
    siblingsCache.value = {};

    topLevelCategories.value = [];
    currentCategory.value = null;
    subcategories.value = [];
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
    fetchCategorySiblings,
    clearCache,
  };
});

