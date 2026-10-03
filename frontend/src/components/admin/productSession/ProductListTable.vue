<script setup lang="ts">
  import type { IProduct } from '@/types/adminProduct';

  defineProps<{
    products: IProduct[];
    loading: boolean;
    isTrashView?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'delete', payload: { id: string; name: string }): void;
    (e: 'status-change', payload: { id: string; status: string }): void;
    (e: 'restore', product: { id: string; name: string }): void;
    (e: 'permanentDelete', product: { id: string; name: string }): void;
  }>();

  // Helper to resolve the primary product image URL
  const getPrimaryImage = (images: IProduct['images']) => {
    if (!images || images.length === 0) return '/placeholder-product.png';
    const primary = images.find((img) => img.isPrimary);
    return primary ? primary.url : images?.[0]?.url;
  };
</script>

<template>
  <div class="rounded-t-lg shadow-2xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-slate-100 bg-[#cdd0d5]/70 text-[11px] dark:border-b-slate-100 font-semibold uppercase tracking-wider dark:text-white/90 dark:bg-[#cdd0d5]/30 text-black/90">
          <tr>
            <th class="py-4 px-5">Product</th>
            <th class="py-4 px-5">Category</th>
            <th class="py-4 px-5">Price</th>
            <th class="py-4 px-5">Stock</th>
            <th class="py-4 px-5">Status</th>
            <th class="py-4 px-5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100  dark:divide-slate-100/20 text-xs bg-[#cdd0d5]/30 dark:bg-[#cdd0d5]/70">
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="6" class="p-8 text-center text-black/90">
              <i class="ri-refresh-line text-lg leading-none inline-block" :class="{ 'animate-spin': loading }"></i>
              <p class="mt-2 text-xs">Loading product catalog...</p>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="products.length === 0">
            <td colspan="6" class="p-8 text-center text-black/90">
              <i class="ri-search-line"></i> No products found matching your filter criteria.
            </td>
          </tr>

          <!-- Product Rows -->
          <tr
            v-else
            v-for="product in products"
            :key="product._id"
            class="hover:bg-slate-50/60 dark:hover:bg-surface-700/30"
          >
            <!-- Product Thumbnail & Name -->
            <td class="py-4 px-5">
              <div class="flex items-center gap-3">
                <img
                  :src="getPrimaryImage(product.images)"
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
            <td class="py-4 px-5 text-black/90">
              <div class="font-medium">
                {{ typeof product.categoryId === 'object' && product.categoryId ? product.categoryId.name : 'Uncategorized' }}
              </div>
            </td>

            <!-- Price & Compare Price -->
            <td class="py-4 px-5 font-semibold text-red-600">
              ${{ product.price.toFixed(2) }}
              <span
                v-if="product.comparePrice && product.comparePrice > product.price"
                class="text-[10px] text-black/60 line-through block font-normal"
              >
                ${{ product.comparePrice.toFixed(2) }}
              </span>
            </td>

            <!-- Stock Level -->
            <td class="py-4 px-5">
              <span
                :class="{
                  'text-red-600 font-semibold': product.stock <= 5,
                  'text-black/90': product.stock > 5,
                }"
              >
                {{ product.stock }} Units
              </span>
            </td>

            <!-- Status Badge -->
            <td class="py-4 px-5">
              <span
                class="px-2 py-0.5  rounded-full font-medium text-black/90 capitalize"
              >
                {{ product.status || 'active' }}
              </span>
            </td>
            <!-- Action Column Buttons -->
            <td class="py-4 px-5 text-right">
              <!-- Trash View Actions -->
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
                  class="p-1.5 ml-1 text-red-600  transition cursor-pointer"
                >
                  <i class="ri-delete-bin-2-line text-base"></i>
                </button>
              </template>

              <!-- Standard View Actions -->
              <template v-else>
                <router-link
                  :to="`/admin/products/edit/${product._id}`"
                  title="Edit Product"
                  class="p-1.5 hover:text-black/70 text-black/90 transition cursor-pointer inline-block"
                >
                  <i class="ri-edit-line text-base"></i>
                </router-link>
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
  </div>
</template>
