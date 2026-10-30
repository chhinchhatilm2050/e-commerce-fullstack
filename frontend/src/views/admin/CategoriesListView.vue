<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import CategoryFormModal from '@/components/admin/categorySession/CategoryFormModal.vue';
  import CategoryFilterBar from '@/components/admin/categorySession/CategoryFilterBar.vue';
  import CategoryListTable from '@/components/admin/categorySession/CategoryListTable.vue';
  import CategoryMetricsCards from '@/components/admin/categorySession/CategoryMetricsCards.vue';
  import CategoryPageHeader from '@/components/admin/categorySession/CategoryPageHeader.vue';
  import CategoryPagination from '@/components/admin/categorySession/CategoryPagination.vue';
  import DeleteConfirmModal from '@/components/admin/productSession/DeleteConfirmModal.vue';
  import RestoreConfirmModel from '@/components/admin/productSession/RestoreConfirmModel.vue';
  import { useAdminCategoryStore } from '@/stores/adminCategory';
  import { useAlert } from '@/composables/useAlert';
  import type { ICategory, ICategoryTreeNode } from '@/types/category';

  const categoryStore = useAdminCategoryStore();
  const { showAlert } = useAlert();

  const isTrashView = ref(false);
  const searchInput = ref('');
  const activeSearch = ref('');
  const selectedStatus = ref('');
  const currentPage = ref(1);
  const isFormOpen = ref(false);
  const categoryToEdit = ref<ICategory | null>(null);
  const categoryToDelete = ref<ICategory | null>(null);
  const categoryToRestore = ref<ICategory | null>(null);
  const isDeleteModalOpen = ref(false);
  const isPermanentDeleteModalOpen = ref(false);
  const isRestoreModalOpen = ref(false);

  const categoriesForView = computed(() =>
    isTrashView.value ? categoryStore.deletedCategories : categoryStore.categories,
  );
  const totalPages = computed(() => categoryStore.pagination?.totalPages ?? 1);
  const totalCategories = computed(() => categoryStore.pagination?.total ?? 0);
  const categoryMetrics = computed(() => {
    const metrics = { total: 0, active: 0, inactive: 0 };
    const countCategories = (nodes: ICategoryTreeNode[]) => {
      for (const node of nodes) {
        metrics.total += 1;
        metrics[node.status] += 1;
        countCategories(node.children);
      }
    };
    countCategories(categoryStore.categoryTree);
    return metrics;
  });
  const parentNames = computed(() => {
    const names: Record<string, string> = {};
    const visit = (nodes: ICategoryTreeNode[], parentName = '') => {
      for (const node of nodes) {
        if (parentName) names[node._id] = parentName;
        visit(node.children, node.name);
      }
    };
    visit(categoryStore.categoryTree);
    return names;
  });

  const parentOptions = computed(() => {
    const excludedIds = new Set<string>();
    const collectDescendants = (nodes: ICategoryTreeNode[], exclude = false) => {
      for (const node of nodes) {
        const isCurrent = node._id === categoryToEdit.value?._id;
        if (exclude || isCurrent) excludedIds.add(node._id);
        collectDescendants(node.children, exclude || isCurrent);
      }
    };
    collectDescendants(categoryStore.categoryTree);

    const options: Array<{ _id: string; name: string; level: number }> = [];
    const flatten = (nodes: ICategoryTreeNode[], level = 0) => {
      for (const node of nodes) {
        if (!excludedIds.has(node._id)) options.push({ _id: node._id, name: node.name, level });
        flatten(node.children, level + 1);
      }
    };
    flatten(categoryStore.categoryTree);
    return options;
  });

  const loadCategories = async () => {
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: 10,
    };
    if (isTrashView.value) {
      await categoryStore.fetchDeletedCategories(params);
    } else {
      params.isDeleted = 'false';
      if (selectedStatus.value) params.status = selectedStatus.value;
      if (activeSearch.value) params.search = activeSearch.value;
      await categoryStore.fetchCategories(params);
    }

    const lastPage = categoryStore.pagination?.totalPages ?? 1;
    if (currentPage.value > lastPage) {
      currentPage.value = lastPage;
      params.page = lastPage;
      if (isTrashView.value) {
        await categoryStore.fetchDeletedCategories(params);
      } else {
        await categoryStore.fetchCategories(params);
      }
    }
  };

  onMounted(async () => {
    await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
  });

  watch([isTrashView, selectedStatus], () => {
    currentPage.value = 1;
    void loadCategories();
  });

  const handleSearch = () => {
    activeSearch.value = searchInput.value.trim();
    currentPage.value = 1;
    if (searchInput.value !== '') {
      void loadCategories();
      searchInput.value = '';
    }
  };

  const handleRefresh = async () => {
    searchInput.value = '';
    activeSearch.value = '';
    selectedStatus.value = '';
    currentPage.value = 1;
    await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
  };

  const handleOpenCreate = () => {
    categoryToEdit.value = null;
    isFormOpen.value = true;
  };

  const handleOpenEdit = (category: ICategory) => {
    categoryToEdit.value = category;
    isFormOpen.value = true;
  };

  const handleSubmitCategory = async (payload: {
    name: string;
    description: string;
    status: ICategory['status'];
    parentId: string | null;
    image: File | null;
  }) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('status', payload.status);
    if (payload.description) formData.append('description', payload.description);
    if (payload.image) formData.append('image', payload.image);

    let result;
    if (categoryToEdit.value) {
      result = await categoryStore.updateCategory(categoryToEdit.value._id, formData);
      if (!result.success) {
        showAlert(result.message, { type: 'error' });
        return;
      }

      if ((categoryToEdit.value.parentId ?? null) !== payload.parentId) {
        const moveResult = await categoryStore.moveCategory(categoryToEdit.value._id, payload.parentId);
        if (!moveResult.success) {
          showAlert(moveResult.message, { type: 'error' });
          await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
          return;
        }
      }
    } else {
      if (payload.parentId) formData.append('parentId', payload.parentId);
      result = await categoryStore.createCategory(formData);
      if (!result.success) {
        showAlert(result.message, { type: 'error' });
        return;
      }
    }

    showAlert(result.message, { type: 'success' });
    isFormOpen.value = false;
    categoryToEdit.value = null;
    await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
  };

  const handleStatusChange = async ({ category, status }: { category: ICategory; status: ICategory['status'] }) => {
    const previousStatus = category.status;
    category.status = status;
    const result = await categoryStore.updateCategoryStatus(category._id, status);
    if (!result.success) {
      category.status = previousStatus;
      showAlert(result.message, { type: 'error' });
      return;
    }
    showAlert(result.message, { type: 'success' });
    await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
  };

  const handleDelete = async () => {
    if (!categoryToDelete.value) return;
    const result = await categoryStore.deleteCategory(categoryToDelete.value._id);
    showAlert(result.message, { type: result.success ? 'success' : 'error' });
    isDeleteModalOpen.value = false;
    if (result.success) {
      isDeleteModalOpen.value = false;
      categoryToDelete.value = null;
      await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
    }
  };

  const handleRestore = async () => {
    if (!categoryToRestore.value) return;
    const result = await categoryStore.restoreCategory(categoryToRestore.value._id);
    showAlert(result.message, { type: result.success ? 'success' : 'error' });
    if (result.success) {
      isRestoreModalOpen.value = false;
      categoryToRestore.value = null;
      await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
    }
  };

  const handlePermanentDelete = async () => {
    if (!categoryToDelete.value) return;
    const result = await categoryStore.deleteCategoryPermanently(categoryToDelete.value._id);
    showAlert(result.message, { type: result.success ? 'success' : 'error' });
    isPermanentDeleteModalOpen.value = false;
    if (result.success) {
      categoryToDelete.value = null;
      await Promise.all([categoryStore.fetchCategoryTree(), loadCategories()]);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    currentPage.value = page;
    void loadCategories();
  };
</script>

<template>
  <div class="flex h-[calc(100vh-96px)] flex-col gap-4">
    <CategoryPageHeader
      v-model:is-trash-view="isTrashView"
      :loading="categoryStore.loading || categoryStore.trashLoading"
      @refresh="handleRefresh"
      @create="handleOpenCreate"
    />

    <CategoryMetricsCards  v-bind="categoryMetrics" />

    <CategoryFilterBar
      
      v-model:search-input="searchInput"
      v-model:selected-status="selectedStatus"
      @search="handleSearch"
    />

    <!-- <div v-if="categoryStore.error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ categoryStore.error }}
    </div> -->

    <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/50 bg-[#cdd0d5]/30 shadow-2xs">
      <div class="flex-1 overflow-auto">
        <CategoryListTable
          :categories="categoriesForView"
          :parent-names="parentNames"
          :loading="isTrashView ? categoryStore.trashLoading : categoryStore.loading"
          :is-trash-view="isTrashView"
          :mutation-loading="categoryStore.mutationLoading"
          @edit="handleOpenEdit"
          @delete="(category) => { categoryToDelete = category; isDeleteModalOpen = true; }"
          @permanent-delete="(category) => { categoryToDelete = category; isPermanentDeleteModalOpen = true; }"
          @restore="(category) => { categoryToRestore = category; isRestoreModalOpen = true; }"
          @status-change="handleStatusChange"
        />
      </div>
      <CategoryPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-categories="totalCategories"
        :loading="categoryStore.loading || categoryStore.trashLoading"
        @page-change="goToPage"
      />
    </section>

    <CategoryFormModal
      :is-open="isFormOpen"
      :category="categoryToEdit"
      :parent-options="parentOptions"
      :loading="categoryStore.mutationLoading"
      @close="isFormOpen = false"
      @submit="handleSubmitCategory"
    />

    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :item-name="categoryToDelete?.name"
      :delete-loading="categoryStore.mutationLoading"
      title="Move Category to Trash"
      button="Move to Trash"
      description="Categories with subcategories or products cannot be deleted."
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
    <DeleteConfirmModal
      :is-open="isPermanentDeleteModalOpen"
      :item-name="categoryToDelete?.name"
      :delete-loading="categoryStore.mutationLoading"
      title="Delete Category Permanently"
      button="Delete Permanently"
      description="This will permanently remove the category and cannot be undone."
      @close="isPermanentDeleteModalOpen = false"
      @confirm="handlePermanentDelete"
    />
    <RestoreConfirmModel
      title="Restore Category"
      :item-name="categoryToRestore?.name"
      :is-open="isRestoreModalOpen"
      :loading="categoryStore.mutationLoading"
      @close="isRestoreModalOpen = false"
      @confirm="handleRestore"
    />
  </div>
</template>
