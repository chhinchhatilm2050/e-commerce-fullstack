<script setup lang="ts">
  import type { IProduct } from '@/types/adminProduct';
  import { getPrimaryImage } from '@/utils/productImage';
  import StatusDropdown from '../orderSession/StatusDropdown.vue';

  defineProps<{
    products: IProduct[];
    loading: boolean;
    deleteLoading?: boolean;
    isTrashView?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'delete', payload: { id: string; name: string }): void;
    (e: 'status-change', payload: { id: string; status: 'draft' | 'active' | 'out_of_stock' }): void;
    (e: 'restore', product: { id: string; name: string }): void;
    (e: 'permanentDelete', product: { id: string; name: string }): void;
    (e: 'edit', product: IProduct): void; 
  }>();

  const productStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'No Stock', value: 'out_of_stock' },
  ];

  async function handleProductStatusChange(productId: string, newStatus: 'draft' | 'active' | 'out_of_stock') {
    emit('status-change', { id: productId, status: newStatus });
  }
</script>

<template>
  <div class="w-full h-full">
    <table class="w-full text-left text-xs border-collapse">
      <!-- Sticky Header -->
      <thead class="sticky top-0 z-10 bg-[#cdd0d5] text-[11px] font-semibold uppercase tracking-wider dark:bg-[#b0b3b8] text-black/90 shadow-xs">
        <tr>
          <th class="py-4 px-5">Product</th>
          <th class="py-4 px-5">Category</th>
          <th class="py-4 px-5">Price</th>
          <th class="py-4 px-5">Stock</th>
          <th class="py-4 px-5">Status</th>
          <th class="py-4 px-5 text-right">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100 dark:divide-slate-100/20 text-xs">
        <!-- Loading State -->
        <tr v-if="loading">
          <td colspan="6" class="p-8 py-30 text-center text-black/90">
            <i class="ri-refresh-line text-lg leading-none inline-block animate-spin"></i>
            <p class="mt-2 text-xs">Loading product catalog...</p>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="products.length === 0">
          <td colspan="6" class="p-8 py-30 text-center text-black/90">
            <i class="ri-search-line"></i> No products found matching your filter criteria.
          </td>
        </tr>

        <!-- Product Rows -->
        <tr
          v-else
          v-for="product in products"
          :key="product._id"
          class="mobile-list-row hover:bg-slate-50/60 dark:hover:bg-surface-700/30"
        >
          <!-- Product Thumbnail & Name -->
          <td data-label="Product" class="py-4 px-5">
            <div class="flex items-center gap-3">
              <img
                :src="getPrimaryImage(product)?.url"
                :alt="product.name"
                class="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
              />
              <div>
                <span class="font-medium text-black/90 capitalize line-clamp-1">
                  {{ product.name }}
                </span>
                <span v-if="product.code" class="text-[10px] text-black/60 block">
                  Code: {{ product.code }}
                </span>
              </div>
            </div>
          </td>

          <!-- Category -->
          <td data-label="Category" class="py-4 px-5 text-black/90">
            <div class="font-medium">
              {{ typeof product.categoryId === 'object' && product.categoryId ? product.categoryId.name : 'Uncategorized' }}
            </div>
          </td>

          <!-- Price & Compare Price -->
          <td data-label="Price" class="py-4 px-5 font-semibold text-red-600">
            ${{ product.price.toFixed(2) }}
            <span
              v-if="product.comparePrice && product.comparePrice > product.price"
              class="text-[10px] text-black/60 line-through block font-normal"
            >
              ${{ product.comparePrice.toFixed(2) }}
            </span>
          </td>

          <!-- Stock Level -->
          <td data-label="Stock" class="py-4 px-5">
            <span
              :class="{
                'text-red-600 font-semibold': product.stock <= 5,
                'text-black/90': product.stock > 5,
              }"
            >
              {{ product.stock }} Units
            </span>
          </td>

          <!-- Status Dropdown Column -->
          <td data-label="Status" class="py-4 px-5 relative overflow-visible">
            <StatusDropdown
              v-model="product.status"
              :entity-id="product._id"
              :options="productStatusOptions"
              :disabled="isTrashView"
              @change="(newStatus) => handleProductStatusChange(product._id, newStatus as 'active' | 'draft' | 'out_of_stock')"
            />
          </td>

          <!-- Action Column Buttons -->
          <td data-label="Actions" class="py-4 px-5 text-right">
            <template v-if="isTrashView">
              <button
                @click="emit('restore', { id: product._id, name: product.name })"
                title="Restore Product"
                class="p-1.5 hover:text-black/70 text-black/90 cursor-pointer"
              >
                <i class="ri-restart-line text-base"></i>
              </button>
              <button
                @click="emit('permanentDelete', { id: product._id, name: product.name })"
                title="Delete Permanently"
                class="p-1.5 ml-1 text-red-600 transition cursor-pointer"
              >
                <i class="ri-delete-bin-2-line text-base"></i>
              </button>
            </template>

            <template v-else>
              <!-- Edit Button Emits Product for Modal -->
              <button
                type="button"
                @click="emit('edit', product)"
                title="Edit Product"
                class="p-1.5 hover:text-black/70 text-black/90 transition cursor-pointer inline-block"
              >
                <i class="ri-edit-line text-base"></i>
              </button>

              <!-- Move to Trash Button -->
              <button
                @click="emit('delete', { id: product._id, name: product.name })"
                title="Move to Trash"
                class="p-1.5 ml-1 text-red-600 hover:text-red-700 cursor-pointer"
              >
                <i class="ri-delete-bin-line text-base"></i>
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  table {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody {
    display: grid;
    gap: 0.75rem;
  }

  tbody > tr.mobile-list-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: visible;
    border: 1px solid rgb(148 163 184 / 0.35);
    border-radius: 0.5rem;
    background: rgb(255 255 255 / 0.55);
  }

  tbody > tr:not(.mobile-list-row) {
    display: block;
  }

  td {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem;
    overflow-wrap: anywhere;
  }

  tbody > tr:not(.mobile-list-row) > td {
    display: block;
  }

  td::before {
    color: rgb(15 23 42 / 0.6);
    content: attr(data-label);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  td:first-child,
  td:last-child {
    grid-column: 1 / -1;
  }

  td:last-child {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    text-align: left;
  }

  td:last-child::before {
    flex-basis: 100%;
  }
}
</style>
