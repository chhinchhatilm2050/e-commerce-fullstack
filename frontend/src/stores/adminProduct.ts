import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch'; 
import type { IProduct, ICategory, IPagination, IDeleteProductResponse, ICategoryNode, IFormattedCategory, ICreateProduct, IUpdateProduct } from '@/types/adminProduct';
import type { IProductListResponse } from '@/types/product';
import axios from 'axios';

export const useProductAdminStore = defineStore('adminProduct', () => {
  const products = ref<IProduct[]>([]);
  const categories = ref<ICategory[]>([]);
  const loading = ref<boolean>(false);
  const deleteLoading = ref<boolean>(false);
  const statusLoading = ref<boolean>(false);
  const createProductLoading = ref<boolean>(false);
  const updateProductLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const categoryTree = ref<ICategoryNode[]>([]);
  const pagination = ref<IPagination | null>(null);
  const pageCache = ref<Map<string, { data: IProduct[]; pagination: IPagination }>>(new Map());
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
  const fetchProductsAdmin = async (params: Record<string, number | string> = {}, forceRefresh = false) => {
    const cacheKey = JSON.stringify(params);
    // Skip cache check if explicit refresh is requested
    if (!forceRefresh && pageCache.value.has(cacheKey)) {
      const cached = pageCache.value.get(cacheKey)!;
      products.value = cached.data;
      pagination.value = cached.pagination;
      return;
    }

    loading.value = true;
    try {
      const { data } = await api.get<IProductListResponse>('/admin/products', { params });
      await delay(300); 
      products.value = data.data;
      pagination.value = data.pagination;

      pageCache.value.set(cacheKey, {
        data: products.value,
        pagination: pagination.value,
      });
    } catch (err) {
      products.value = [];
      pagination.value = null;
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to fetch products') : 'An unexpected error occurred.';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    pageCache.value.clear();
  };

  const deleteProduct = async (id: string) => {
    deleteLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<IDeleteProductResponse>(`/admin/products/${id}`);
      await delay(300);
      
      // 1. Remove deleted product from current local state
      products.value = products.value.filter((p) => p._id !== id);
      
      // 2. Clear page cache so subsequent re-fetches fetch fresh server data
      clearCache();
      
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      deleteLoading.value = false;
    }
  };

  const updateProductStatus = async(id: string, newStatus: 'draft' | 'active' | 'out_of_stock') => {
    statusLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{success: boolean; message: string}>(`/admin/products/${id}/status`, { status: newStatus });
      if (data.success) {
        const item = products.value.find((p) => p._id === id);
        if (item) {
          item.status = newStatus;
        }
      }
      return data;
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      statusLoading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories/tree');
      categoryTree.value = response.data.data.tree;
    } catch  {
      categoryTree.value = [];
    }
  };

  // Input: Represents a node in your nested category tree
  // Flatten helper to add visual depth prefixes
  const flattenCategories = (nodes: ICategoryNode[], level = 0): IFormattedCategory[] => {
    let result: IFormattedCategory[] = [];

    for (const node of nodes) {
      // Adds non-breaking spaces for depth, plus a single arrow
      const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level > 0 ? level - 1 : 0);
      const prefix = level > 0 ? `${indent}•  ` : '';

      result.push({
        _id: node._id,
        name: level > 0 ? `${prefix}${node.name}` : node.name,
        level,
      });

      if (node.children && node.children.length > 0) {
        result = result.concat(flattenCategories(node.children, level + 1));
      }
    }

    return result;
  };

  const restoreProduct = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<IDeleteProductResponse>(`/admin/products/${id}/restore`);
      await delay(300);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const deleteProductPermanently = async (id: string) => {
    deleteLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete(`/admin/products/${id}/permanent`);
      await delay(300);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Verification failed.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      deleteLoading.value = false;
    }
  };

  const crateProduct = async(payload: ICreateProduct) => {
    createProductLoading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('categoryId', payload.categoryId);
      formData.append('price', String(payload.price));
      formData.append('stock', String(payload.stock));
      formData.append('status', payload.status);
      if (payload.comparePrice !== undefined) {
        formData.append('comparePrice', String(payload.comparePrice));
      }
      if (payload.description) {
        formData.append('description', payload.description);
      }
      formData.append('specifications', JSON.stringify(payload.specifications));
      payload.images.forEach((file) => {
        formData.append('images', file);
      });

      const { data } = await api.post<{message: string, success: boolean}>('/admin/products', formData);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Create Product fail.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      createProductLoading.value = false;
    }
  };

  const updateProduct = async(id: string, payload: IUpdateProduct) => {
    updateProductLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<{ message: string, success: boolean }>(`/admin/products/${id}`, payload);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Update Product fail.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      updateProductLoading.value = false;
    }
  };

  const uploadProductImages = async (id: string, files: File[]) => {
    loading.value = true;
    error.value = null;
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    try {
      const { data } = await api.post<{message: string, success: boolean}>(`/admin/products/${id}/images`, formData);
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Fail to upload image.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const removeProductImage = async(id: string, publicId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<{message: string, success: boolean}>(`/admin/products/${id}/image`, { data: { publicId } });
      return { message: data.message, success: data.success };
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Fail to upload image.') : 'An unexpected error occurred.';
      error.value = message;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    error,
    categories,
    pagination,
    deleteLoading,
    categoryTree,
    createProductLoading,
    updateProductLoading,
    clearCache,
    fetchProductsAdmin,
    deleteProduct,
    updateProductStatus,
    fetchCategories,
    flattenCategories,
    restoreProduct,
    deleteProductPermanently,
    crateProduct,
    updateProduct,
    uploadProductImages,
    removeProductImage,
  };
});
