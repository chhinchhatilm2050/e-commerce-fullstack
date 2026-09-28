<script setup lang="ts">
  import StatusDropdown from '@/components/admin/StatusDropdown.vue';
  import type { IOrder } from '@/types/iorder';
  import type { IProductImage } from '@/types/product';

  defineProps<{
    orders: IOrder[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    'view-details': [ { id: string}];
    'delete-order': [{ id: string, tranId: string}];
    'status-change': [{order: IOrder, newStatus: string}];
  }>();

  // Helper: Extract product image URL safely
  const getImageUrl = (image: string | IProductImage): string => {
    if (!image) return '/placeholder.png';
    if (typeof image === 'string' && image.startsWith('http')) {
      return image;
    }
    if (typeof image === 'string') {
      const match = image.match(/url:\s*['"]([^'"]+)['"]/);
      if (match && match[1]) return match[1];

      try {
        const parsed = JSON.parse(image);
        return parsed.url || '/placeholder.png';
      } catch {
        return '/placeholder.png';
      }
    }
    return image.url || '/placeholder.png';
  };

  // Helper: Format date string safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

</script>

<template>
  <div class="rounded-lg border border-slate-100 dark:border-surface-700 shadow-2xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b text-center border-slate-100 bg-[#cdd0d5]/70 text-[11px] dark:border-b-slate-100 font-semibold uppercase tracking-wider dark:text-white/90 dark:bg-[#cdd0d5]/30 text-black/90">
            <th class="py-4 px-5">Order</th>
            <th class="py-4 px-5">Payment</th>
            <th class="py-4 px-5">Items</th>
            <th class="py-4 px-5">Date</th>
            <th class="py-4 px-5">Total</th>
            <th class="py-4 px-5">Status</th>
            <th class="py-4 px-5">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-center dark:divide-slate-100/20 text-xs bg-[#cdd0d5]/30 dark:bg-[#cdd0d5]/70">
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="7" class="py-12 text-center text-black/80 text-xs">
              <i class="ri-loader-4-line animate-spin text-lg inline-block mr-2"></i>
              Loading database orders...
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-else-if="orders.length > 0"
            v-for="order in orders"
            :key="order._id || order.tran_id"
            class="hover:bg-slate-50/60 dark:hover:bg-surface-700/30 "
          >
            <!-- Order ID -->
            <td class="py-4 px-5 font-bold text-slate-900">
              {{ order.tran_id || order._id }}
            </td>

            <!-- Payment Status Badge -->
            <td class="py-4 px-5 flex items-center justify-center">
              <div
                class="px-2.5 py-1 w-[60px] mt-2 rounded-sm text-[11px] font-medium border border-black/60 dark:text-black/60 capitalize"
              >
                {{ order.paymentStatus?.toLowerCase() }}
              </div>
            </td>

            <!-- Items Preview -->
            <td class="py-4 px-5 text-center">
              <div class="flex items-center gap-2 ml-8">
                <div class="w-10 h-10 rounded-sm bg-slate-100 dark:bg-surface-700 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-surface-600">
                  <img 
                    v-if="order.items && order.items[0]?.image" 
                    :src="getImageUrl(order.items[0].image)" 
                    :alt="order.items[0].name" 
                    class="w-full h-full object-cover" 
                  />
                  <i v-else class="ri-shopping-bag-line text-black/80 dark:text-black/80 text-sm"></i>
                </div>

                <span class="text-black/80 dark:text-black/80 truncate max-w-[200px]">
                  {{ order.items && order.items[0]?.name ? order.items[0].name : 'No items' }}
                  <span v-if="order.items && order.items.length > 1" class="text-black/80 font-normal">
                    +{{ order.items.length - 1 }} more
                  </span>
                </span>
              </div>
            </td>

            <!-- Date -->
            <td class="py-4 px-5 text-black/80 dark:text-black/80">
              {{ formatDate(order.createdAt) }}
            </td>

            <!-- Total Amount -->
            <td class="py-4 px-5 font-bold text-red-700">
              ${{ (order.amount || order.amount || 0).toFixed(2) }}
            </td>

            <!-- Status Dropdown -->
            <td class="py-4 px-5 flex items-center justify-center">
              <StatusDropdown
                v-model="order.status"
                :order-id="order._id"
                @change="emit('status-change', { order, newStatus: $event })"
              />
            </td>

            <!-- Action Icons -->
            <td class="py-4 px-5 ">
              <div class="flex items-center justify-center gap-3 text-slate-400">
                <button
                  @click="emit('view-details', {id: order._id})"
                  class="hover:text-slate-700 text-black/90 transition cursor-pointer"
                  title="View Details"
                >
                  <i class="ri-eye-line text-base"></i>
                </button>
                <button
                  @click="emit('delete-order', { id: order._id, tranId: order.tran_id })"
                  class="hover:text-rose-700 transition text-red-600 cursor-pointer"
                  title="Cancel Order"
                >
                  <i class="ri-delete-bin-line text-base"></i>
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else>
            <td colspan="7" class="py-12 text-center text-black/90 text-xs">
            <i class="ri-search-line"></i>  No orders match your search criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
