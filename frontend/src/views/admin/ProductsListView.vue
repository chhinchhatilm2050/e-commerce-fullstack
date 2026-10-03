<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import { useProductAdminStore } from '@/stores/adminProduct';
  import ProductListTable from '@/components/admin/productSession/ProductListTable.vue';
  import DeleteConfirmModal from '@/components/admin/productSession/DeleteConfirmModal.vue';
  import RestoreConfirmModel from '@/components/admin/productSession/RestoreConfirmModel.vue';
  import ProductFilterBar from '@/components/admin/productSession/ProductFilterBar.vue';
  import ProductPagination from '@/components/admin/productSession/ProductPagination.vue';
  import { useAlert } from '@/composables/useAlert';

  const productAdminStore = useProductAdminStore();
  const { showAlert } = useAlert();

  // Filter & Sort States
  const searchInput = ref('');
  const selectedCategory = ref('');
  const selectedStatus = ref('');
  const selectedStockStatus = ref('');
  const selectedSort = ref('recommend');
  const currentPage = ref(1);
  const isTrashView = ref(false);

  // Modal States
  const isDeleteModalOpen = ref(false);
  const isRestoreModalOpen = ref(false);
  const productToDelete = ref<{ id: string; name: string } | null>(null);
  const selectedProduct = ref<{ id: string; name: string } | null>(null);

  const formattedCategories = computed(() => {
    return productAdminStore.flattenCategories(productAdminStore.categoryTree || []);
  });

  const loadProducts = async () => {
    const params: Record<string, number | string> = {
      page: currentPage.value.toString(),
      limit: 10,
      isDeleted: isTrashView.value.toString(),
    };

    if (searchInput.value.trim()) params.search = searchInput.value.trim();
    if (selectedCategory.value) params.categoryId = selectedCategory.value;
    if (!isTrashView.value && selectedStatus.value) params.status = selectedStatus.value;
    if (!isTrashView.value && selectedStockStatus.value) params.stockStatus = selectedStockStatus.value;
    if (selectedSort.value) params.sort = selectedSort.value;

    await productAdminStore.fetchProductsAdmin(params);
  };

  const handleFilterChange = () => {
    currentPage.value = 1;
    loadProducts();
  };

  const resetFilters = () => {
    searchInput.value = '';
    selectedCategory.value = '';
    selectedStatus.value = '';
    selectedStockStatus.value = '';
    selectedSort.value = 'recommend';
    handleFilterChange();
  };

  const handleSearch = () => {
    handleFilterChange();
    searchInput.value = '';
  };

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      loadProducts();
    }
  };

  const goToNextPage = () => {
    if (currentPage.value < (productAdminStore.pagination?.totalPages || 1)) {
      currentPage.value++;
      loadProducts();
    }
  };

  watch([selectedCategory, selectedStatus, selectedStockStatus, selectedSort, isTrashView], () => {
    handleFilterChange();
  });

  onMounted(async () => {
    await Promise.all([
      productAdminStore.fetchCategories(),
      loadProducts(),
    ]);
  });

  const handleOpenDeleteModal = (payload: { id: string; name: string }) => {
    productToDelete.value = payload;
    isDeleteModalOpen.value = true;
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete.value) return;
    const result = await productAdminStore.deleteProduct(productToDelete.value.id);
    if (result?.success) {
      showAlert(result.message, { type: 'success' });
    }
    isDeleteModalOpen.value = false;
    productToDelete.value = null;
    await loadProducts();
  };

  const handleOpenRestoreModal = (payload: { id: string; name: string }) => {
    selectedProduct.value = payload;
    isRestoreModalOpen.value = true;
  };

  // const handleConfirmRestore = async () => {
  //   if (!selectedProduct.value) return;
  //   try {
  //     await productAdminStore.restoreProduct(selectedProduct.value.id);
  //     isRestoreModalOpen.value = false;
  //     selectedProduct.value = null;
  //     await loadProducts();
  //   } catch (err) {
  //     // Handled in store
  //   }
  // };

  const handleRefresh = async () => {
    productAdminStore.clearCache();
    await loadProducts();
  };
</script>

<template>
  <div class="space-y-5 animate-slide-up">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#cdd0d5]/70 p-5 rounded-lg">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-white text-black/80 shadow-lg rounded-lg">
          <i class="ri-box-3-line text-2xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-black/80">Product Catalog</h1>
          <p class="text-xs text-black/80 mt-0.5">Manage inventory levels, categories, and visibility options</p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="handleRefresh"
          :disabled="productAdminStore.loading"
          class="hidden sm:inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <i class="ri-refresh-line text-sm leading-none" :class="{ 'animate-spin': productAdminStore.loading }"></i>
          <span>Refresh</span>
        </button>

        <div class="inline-flex rounded-md bg-white/50 p-1 border shadow-sm border-slate-300/40">
          <button
            @click="isTrashView = false"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition flex items-center gap-1.5 cursor-pointer',
              !isTrashView ? 'bg-white text-black/80 shadow-sm' : 'text-black/80'
            ]"
          >
            <i class="ri-list-check"></i>
            <span>Active List</span>
          </button>

          <button
            @click="isTrashView = true"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer flex items-center gap-1.5',
              isTrashView ? 'bg-red-700/80 text-white shadow-sm' : 'text-black/80 hover:text-red-600'
            ]"
          >
            <i class="ri-delete-bin-line"></i>
            <span>Trash Bin</span>
          </button>
        </div>

        <button
          class="inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium transition shadow-sm cursor-pointer"
        >
          <i class="ri-add-circle-line text-sm leading-none"></i>
          <span>Add Product</span>
        </button>
      </div>
    </div>

    <!-- Filter Component -->
    <ProductFilterBar
      v-model:search-input="searchInput"
      v-model:selected-category="selectedCategory"
      v-model:selected-status="selectedStatus"
      v-model:selected-stock-status="selectedStockStatus"
      v-model:selected-sort="selectedSort"
      :categories="formattedCategories"
      :is-trash-view="isTrashView"
      @search="handleSearch"
      @reset="resetFilters"
    />
  </div>

  <div class="mt-5 animate-slide-up">
    <!-- Product Table Component -->
    <ProductListTable
      :products="productAdminStore.products"
      :loading="productAdminStore.loading"
      :deleteLoading="productAdminStore.deleteLoading"
      :is-trash-view="isTrashView"
      @delete="handleOpenDeleteModal"
      @restore="handleOpenRestoreModal"
    />

    <!-- Pagination Component -->
    <ProductPagination
      :current-page="currentPage"
      :pagination="productAdminStore.pagination"
      :loading="productAdminStore.loading"
      @prev="goToPreviousPage"
      @next="goToNextPage"
    />

    <!-- Modals -->
    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :item-name="productToDelete?.name"
      :deleteLoading="productAdminStore.deleteLoading"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />

    <RestoreConfirmModel
      :is-open="isRestoreModalOpen"
      :item-name="selectedProduct?.name"
      :loading="productAdminStore.loading"
      @close="isRestoreModalOpen = false"
    />
  </div>
</template>
