<script setup lang="ts">
  import CategorySelect from '@/components/admin/productSession/CategorySelect.vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';

  interface Props {
    isTrashView?: boolean;
    categories: Array<{ _id: string; name: string; level: number }>;
  }

  withDefaults(defineProps<Props>(), {
    isTrashView: false,
  });

  // v-models for two-way binding with parent
  const searchInput = defineModel<string>('searchInput', { default: '' });
  const selectedCategory = defineModel<string>('selectedCategory', { default: '' });
  const selectedStatus = defineModel<string>('selectedStatus', { default: '' });
  const selectedStockStatus = defineModel<string>('selectedStockStatus', { default: '' });
  const selectedSort = defineModel<string>('selectedSort', { default: 'recommend' });

  const emit = defineEmits<{
    (e: 'search'): void;
    (e: 'reset'): void;
  }>();

  const productStatusOption = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
  ];

  const productStockOption = [
    { value: '', label: 'All Inventory' },
    { value: 'low-stock', label: 'Low Stock (≤ 5)' },
    { value: 'out-of-stock', label: 'Out of Stock (0)' },
  ];

  const productSortOption = [
    { value: 'recommend', label: 'Recommend' },
    { value: 'newest', label: 'New items' },
    { value: 'price_high', label: 'Price (High First)' },
    { value: 'price_low', label: 'Price (Low First)' },
    { value: 'discount_high', label: 'Discount (High First)' },
    { value: 'discount_low', label: 'Discount (Low First)' },
  ];
</script>

<template>
  <div class="p-4 bg-[#cdd0d5]/70 rounded-md shadow-sm space-y-3 animate-slide-up">
    <div class="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center">
      <!-- Search Input -->
      <div class="relative flex-1 w-full">
        <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50 text-sm"></i>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by name or code..."
          @keyup.enter="emit('search')"
          class="w-full pl-9 pr-4 py-2 text-xs dark:text-black/90 bg-white dark:bg-white/50 border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#cdd0d5] dark:placeholder-zinc-950/60"
        />
      </div>
      <div>
        <button
          @click="emit('search')"
          class="px-3 py-2 subCategory-button text-xs shrink-0 rounded-sm bg-black/80 text-white cursor-pointer"
        >
          Search
        </button>
      </div>

      <!-- Dropdowns Wrapper -->
      <div class="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        <!-- Category Dropdown -->
        <CategorySelect
          v-model="selectedCategory"
          :categories="categories"
          placeholder="All Categories"
        />

        <!-- Status Filter (Hidden in Trash) -->
        <div v-if="!isTrashView">
          <BaseDropdown v-model="selectedStatus" :options="productStatusOption" />
        </div>

        <!-- Stock Filter (Hidden in Trash) -->
        <div v-if="!isTrashView">
          <BaseDropdown v-model="selectedStockStatus" :options="productStockOption" />
        </div>

        <!-- Sort Dropdown -->
        <div>
          <BaseDropdown v-model="selectedSort" :options="productSortOption" />
        </div>

        <!-- Reset Filter Button -->
        <button
          @click="emit('reset')"
          title="Reset Filters"
          class="py-2 px-2.5 text-xs font-medium text-black/80 bg-white rounded-sm cursor-pointer transition"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>
  </div>
</template>
