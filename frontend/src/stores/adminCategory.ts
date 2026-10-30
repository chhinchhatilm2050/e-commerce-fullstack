import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/composables/useFetch.js';
import type {
  ICategory,
  ICategoryAdminListResponse,
  ICategoryAdminTreeResponse,
  ICategoryTrashResponse,
  ICategoryTreeNode,
} from '@/types/category';

interface ICategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type CategoryMutationResult = { success: boolean; message: string; category?: ICategory };

export const useAdminCategoryStore = defineStore('adminCategory', () => {
  const categories = ref<ICategory[]>([]);
  const categoryTree = ref<ICategoryTreeNode[]>([]);
  const deletedCategories = ref<ICategory[]>([]);
  const pagination = ref<ICategoryPagination | null>(null);
  const loading = ref(false);
  const treeLoading = ref(false);
  const trashLoading = ref(false);
  const mutationLoading = ref(false);
  const error = ref<string | null>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const getErrorMessage = (err: unknown, fallback: string) =>
    axios.isAxiosError(err)
      ? err.response?.data?.message ?? fallback
      : fallback;

  const fetchCategories = async (params: Record<string, string | number>) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ICategoryAdminListResponse>('/admin/categories', { params });
      await delay(300);
      categories.value = data.data;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load categories.');
      categories.value = [];
      pagination.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryTree = async () => {
    treeLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ICategoryAdminTreeResponse>('/admin/categories/tree', {
        params: { isDeleted: false },
      });
      categoryTree.value = data.data.tree;
      return true;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load category hierarchy.');
      categoryTree.value = [];
      return false;
    } finally {
      treeLoading.value = false;
    }
  };

  const fetchDeletedCategories = async (params: Record<string, string | number>) => {
    trashLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ICategoryTrashResponse>('/admin/categories/trash', { params });
      await delay(300);
      deletedCategories.value = data.data.deleteCategories;
      pagination.value = data.pagination;
      return true;
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load deleted categories.');
      deletedCategories.value = [];
      pagination.value = null;
      return false;
    } finally {
      trashLoading.value = false;
    }
  };

  const createCategory = async (payload: FormData): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<{ success: boolean; message: string; data: { category: ICategory } }>(
        '/admin/categories',
        payload,
      );
      return { success: data.success, message: data.message, category: data.data.category };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to create category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const updateCategory = async (id: string, payload: FormData): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<{ success: boolean; message: string; data: { category: ICategory } }>(
        `/admin/categories/${id}`,
        payload,
      );
      return { success: data.success, message: data.message, category: data.data.category };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const moveCategory = async (id: string, newParentId: string | null): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ success: boolean; message: string; data: { category: ICategory } }>(
        `/admin/categories/${id}/move`,
        { newParentId },
      );
      return { success: data.success, message: data.message, category: data.data.category };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to move category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const updateCategoryStatus = async (id: string, status: ICategory['status']): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ success: boolean; message: string; data: { category: ICategory } }>(
        `/admin/categories/${id}/status`,
        { status },
      );
      return { success: data.success, message: data.message, category: data.data.category };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update category status.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const deleteCategory = async (id: string): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<{ success: boolean; message: string }>(`/admin/categories/${id}`);
      return { success: data.success, message: data.message };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const deleteCategoryPermanently = async (id: string): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<{ success: boolean; message: string }>(
        `/admin/categories/${id}/permanent`,
      );
      return { success: data.success, message: data.message };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to permanently delete category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  const restoreCategory = async (id: string): Promise<CategoryMutationResult> => {
    mutationLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<{ success: boolean; message: string }>(`/admin/categories/${id}/restore`);
      return { success: data.success, message: data.message };
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to restore category.');
      error.value = message;
      return { success: false, message };
    } finally {
      mutationLoading.value = false;
    }
  };

  return {
    categories,
    categoryTree,
    deletedCategories,
    pagination,
    loading,
    treeLoading,
    trashLoading,
    mutationLoading,
    error,
    fetchCategories,
    fetchCategoryTree,
    fetchDeletedCategories,
    createCategory,
    updateCategory,
    moveCategory,
    updateCategoryStatus,
    deleteCategory,
    deleteCategoryPermanently,
    restoreCategory,
  };
});
