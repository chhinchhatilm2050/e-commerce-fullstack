import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/composables/useFetch'; 
import type { IProduct, ICategory, IPagination, IDeleteProductResponse, ICategoryNode, IFormattedCategory } from '@/types/adminProduct';
import type { IProductListResponse } from '@/types/product';
import axios from 'axios';

export const useProductAdminStore = defineStore('adminProduct', () => {
  const products = ref<IProduct[]>([]);
  const categories = ref<ICategory[]>([]);
  const loading = ref(false);
  const deleteLoading = ref(false);
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
      const message = axios.isAxiosError(err) ? (err.response?.data.message ?? 'Failed to fetch products') : 'Failed to fetch products';
      error.value = message;
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    pageCache.value.clear();
  };

  // Soft Delete Product (DELETE /api/admin/products/:id)
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

  // Quick Status Toggle (PATCH /api/admin/products/:id/status)
  // const updateProductStatus = async (id: string, status: string) => {
  //   try {
  //     const { data } = await api.patch(`/admin/products/${id}/status`, { status });
  //     const index = products.value.findIndex((p) => p._id === id);
  //     if (index !== -1) {
  //       products.value[index].status = status as any;
  //     }
  //     return data;
  //   } catch (err: any) {
  //     error.value = err.response?.data?.message || 'Failed to update status';
  //     throw err;
  //   }
  // };
  
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
      const prefix = '#'.repeat(level);
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

  return {
    products,
    loading,
    error,
    categories,
    pagination,
    deleteLoading,
    fetchProductsAdmin,
    deleteProduct,
    // updateProductStatus,
    categoryTree,
    fetchCategories,
    flattenCategories,
    clearCache,
  };
});
