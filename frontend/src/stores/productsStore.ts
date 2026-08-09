import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type {
  IProduct,
  IReview,
  IPagination,
  IProductListResponse,
  IProductDetailResponse,
} from '@/types/product.js';

export const useProductsStore = defineStore('products', () => {
  const products = ref<IProduct[]>([]);
  const currentProduct = ref<IProduct | null>(null);
  const reviews = ref<IReview[]>([]);
  const reviewPagination = ref<IPagination | null>(null);
  const pagination = ref<IPagination | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string>('');
  const featureProducts = ref<IProduct[]>([]);
  const homeSections = ref<Record<string, IProduct[]>>({});

  const fetchProductsByCategory = async (slug: string, query: Record<string, string | number> = {}) => {
    loading.value = true;
    error.value = '';
    try {
      const params = new URLSearchParams(query as Record<string, string>).toString();
      const { data } = await api.get<IProductListResponse>(`/products/category/${slug}?${params}`);
      console.log(data);
      products.value = data.data;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to load products' : 'Failed to load products';
      products.value = [];
      pagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllProducts = async (query: Record<string, string | number> = {}) => {
    loading.value = true;
    error.value = '';
    try {
      const params = new URLSearchParams(query as Record<string, string>).toString();
      const { data } = await api.get<IProductListResponse>(`/products?${params}`);
      products.value = data.data;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to load products' : 'Failed to load products';
      products.value = [];
      pagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductDetail = async (id: string, reviewPage = 1) => {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.get<IProductDetailResponse>(`/products/${id}?reviewPage=${reviewPage}`);
      currentProduct.value = data.data.product;
      reviews.value = data.data.reviews;
      reviewPagination.value = data.data.reviewPagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to load product detail' : 'Failed to load product detail';
      currentProduct.value = null;
      reviews.value = [];
      reviewPagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const loadingMore = ref<boolean>(false);
  const fetchMoreProductByCategory = async (slug: string, query: Record<string, string | number> = {}) => {
    if (loadingMore.value) return false;
    loadingMore.value = true;
    error.value = '';

    try {
      const params = new URLSearchParams(query as Record<string, string>).toString();
      const { data } = await api.get<IProductListResponse>(`/products/category/${slug}?${params}`);
      products.value.push(...data.data);
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err) ? err.response?.data?.message ?? 'Failed to load more products' : 'Failed to load more products';
      return false;
    } finally {
      loadingMore.value = false;
    }
  };

  // Fix: swap loading → loadingMore throughout fetchMoreAllProducts
  const fetchMoreAllProducts = async (query: Record<string, string> = {}) => {
    if (loadingMore.value) return false;
    loadingMore.value = true;
    try {
      const params = new URLSearchParams(query).toString();
      const { data } = await api.get<IProductListResponse>(`/products?${params}`);
      products.value.push(...data.data);
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load more products'
        : 'Failed to load more products';
      return false;
    } finally {
      loadingMore.value = false;
    }
  };

  const fetchFeaturenProducts = async () => {
    try {
      const { data } = await api.get<IProductListResponse>('/products?minRating=4.7&sort=recommend&limit=20');
      featureProducts.value = data.data;
    } catch {
      featureProducts.value = [];
    }
  };

  const fetchProductSection = async (key: string, query: Record<string, string>, forceRefresh = false) => {
    if (!forceRefresh && (homeSections.value[key]?.length ?? 0) > 0) {
      return;
    };
    try {
      const params = new URLSearchParams(query).toString();
      const { data } = await api.get<IProductListResponse>(`/products?${params}`);
      homeSections.value[key] = data.data;
    } catch {
      homeSections.value[key] = [];
    }
  };

  return {
    products,
    currentProduct,
    reviews,
    reviewPagination,
    pagination,
    loading,
    loadingMore,
    error,
    featureProducts,
    homeSections,
    fetchProductsByCategory,
    fetchAllProducts,
    fetchProductDetail,
    fetchMoreProductByCategory,
    fetchMoreAllProducts,
    fetchFeaturenProducts,
    fetchProductSection,
  };
});
