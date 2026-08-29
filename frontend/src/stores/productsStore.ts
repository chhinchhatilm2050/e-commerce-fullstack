import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type {
  IProduct,
  IPagination,
  IProductListResponse,
  IProductDetailResponse,
} from '@/types/product.js';

export const useProductsStore = defineStore('products', () => {
  const products = ref<IProduct[]>([]);
  const currentProduct = ref<IProduct | null>(null);
  const pagination = ref<IPagination | null>(null);

  const loading = ref<boolean>(false);
  const loadingDetail = ref<boolean>(false);
  const loadingMore = ref<boolean>(false);
  const loadingRelated = ref<boolean>(false); 
  const error = ref<string>('');

  const featureProducts = ref<IProduct[]>([]);
  const homeSections = ref<Record<string, IProduct[]>>({});
  const relatedProducts = ref<IProduct[]>([]);

  const fetchProductsByCategory = async (slug: string, query: Record<string, string | number> = {}) => {
    const params = new URLSearchParams(query as Record<string, string>).toString();
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.get<IProductListResponse>(`/products/category/${slug}?${params}`);
      products.value = data.data;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load products'
        : 'Failed to load products';
      products.value = [];
      pagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllProducts = async (query: Record<string, string | number> = {}) => {
    const params = new URLSearchParams(query as Record<string, string>).toString();
    loading.value = true;
    error.value = '';

    try {
      const { data } = await api.get<IProductListResponse>(`/products?${params}`);

      products.value = data.data;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load products'
        : 'Failed to load products';
      products.value = [];
      pagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductDetail = async (slug: string) => {
    loadingDetail.value = true;
    error.value = '';
    try {
      const { data } = await api.get<IProductDetailResponse>(`/products/${slug}`);

      currentProduct.value = data.data.product;
      return true;
    } catch (err) {
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load product detail'
        : 'Failed to load product detail';
      currentProduct.value = null;
      return false;
    } finally {
      loadingDetail.value = false;
    }
  };

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
      error.value = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load more products'
        : 'Failed to load more products';
      return false;
    } finally {
      loadingMore.value = false;
    }
  };

  const fetchMoreAllProducts = async (query: Record<string, string | number> = {}) => {
    if (loadingMore.value) return false;
    loadingMore.value = true;
    error.value = '';

    try {
      const params = new URLSearchParams(query as Record<string, string>).toString();
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

  const fetchFeaturedProducts = async (forceRefresh = false) => {
    if (!forceRefresh && featureProducts.value.length > 0) return;
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
    }
    try {
      const params = new URLSearchParams(query).toString();
      const { data } = await api.get<IProductListResponse>(`/products?${params}`);
      homeSections.value[key] = data.data;
      return true;
    } catch {
      homeSections.value[key] = [];
      return false;
    }
  };

  const fetchRelatedProducts = async (categorySlug: string, currentProductId: string) => {
    loadingRelated.value = true;
    try {
      const { data } = await api.get<IProductListResponse>(
        `/products/category/${categorySlug}?limit=21`,
      );
      relatedProducts.value = data.data
        .filter((product: IProduct) => product._id !== currentProductId)
        .slice(0, 20);
      return true;
    } catch {
      relatedProducts.value = [];
      return false;
    } finally {
      loadingRelated.value = false;
    }
  };

  return {
    products,
    currentProduct,
    pagination,
    loading,
    loadingMore,
    loadingDetail,
    loadingRelated,
    error,
    featureProducts,
    homeSections,
    relatedProducts,
    fetchProductsByCategory,
    fetchAllProducts,
    fetchProductDetail,
    fetchMoreProductByCategory,
    fetchMoreAllProducts,
    fetchFeaturedProducts,
    fetchProductSection,
    fetchRelatedProducts,
  };
});

