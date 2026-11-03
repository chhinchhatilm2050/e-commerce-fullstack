<script setup lang="ts">
  import StatusDropdown from '@/components/admin/orderSession/StatusDropdown.vue';
  import type { IOrder } from '@/types/iorder';
  import { getImageUrl } from '@/utils/getImageUrl';

  defineProps<{
    orders: IOrder[];
    loading: boolean;
    isTrashView: boolean;
  }>();

  const emit = defineEmits<{
    'view-details': [{ id: string }];
    'delete-order': [{ id: string; tranId: string }];
    'status-change': [{ order: IOrder; newStatus: string }];
  }>();

  // Helper: Format date string safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const orderStatusOption = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];
</script>

<template>
  <table class="w-full text-left ">
    <!-- Sticky Header Row -->
    <thead class="sticky top-0 z-10 bg-[#cdd0d5] dark:bg-[#b0b3b8] text-[11px] font-semibold uppercase tracking-wider text-black/90  shadow-xs">
      <tr class="text-center">
        <th class="py-3 px-5 text-left">Order</th>
        <th class="py-3 px-5">Payment</th>
        <th class="py-3 px-5 text-left">Items</th>
        <th class="py-3 px-5">Date</th>
        <th class="py-3 px-5">Total</th>
        <th class="py-3 px-5">Status</th>
        <th class="py-3 px-5 text-right">Actions</th>
      </tr>
    </thead>

    <tbody class="divide-y divide-slate-100 dark:divide-slate-100/20 text-xs">
      <!-- Loading State -->
      <tr v-if="loading">
        <td colspan="7" class="py-25 text-center text-black/80 text-xs">
          <div class="flex flex-col items-center justify-center gap-2">
            <i class="ri-refresh-line text-lg leading-none inline-block" :class="{ 'animate-spin': loading }"></i>
            <span>Loading database orders...</span>
          </div>
        </td>
      </tr>

      <!-- Data Rows -->
      <tr
        v-else-if="orders.length > 0"
        v-for="order in orders"
        :key="order._id || order.tran_id"
        class="mobile-list-row hover:bg-slate-50/60 dark:hover:bg-surface-700/30 transition-colors"
      >
        <!-- Order ID -->
        <td data-label="Order" class="py-3 px-5 font-bold text-black/90">
          {{ order.tran_id || order._id }}
        </td>

        <!-- Payment Status Badge -->
        <td data-label="Payment" class="py-3 px-5 text-center">
          <span
            class="mobile-payment-status inline-block w-[62px] py-0.5 rounded-sm text-[11px] font-medium border border-black/40 text-black/80 capitalize"
          >
            {{ order.paymentStatus?.toLowerCase() }}
          </span>
        </td>

        <!-- Items Preview -->
        <td data-label="Items" class="py-3 px-5">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-sm bg-slate-100 dark:bg-surface-700 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-surface-600">
              <img 
                v-if="order.items && order.items[0]?.image" 
                :src="getImageUrl(order.items[0].image)" 
                :alt="order.items[0].name" 
                class="w-full h-full object-cover" 
              />
              <i v-else class="ri-shopping-bag-line text-black/80 dark:text-slate-300 text-sm"></i>
            </div>

            <span class="text-black/80 truncate max-w-[200px]">
              {{ order.items && order.items[0]?.name ? order.items[0].name : 'No items' }}
              <span v-if="order.items && order.items.length > 1" class="text-red-600 font-normal">
                +{{ order.items.length - 1 }} more
              </span>
            </span>
          </div>
        </td>

        <!-- Date -->
        <td data-label="Date" class="py-3 px-5 text-center text-black/80">
          {{ formatDate(order.createdAt) }}
        </td>

        <!-- Total Amount -->
        <td data-label="Total" class="py-3 px-5 text-center font-bold text-red-600">
          ${{ (order.amount || 0).toFixed(2) }}
        </td>

        <!-- Status Dropdown -->
        <td data-label="Status" class="py-3 px-5 text-center">
          <div class="flex items-center justify-center">
            <StatusDropdown
              class="mobile-order-status"
              v-model="order.status"
              :entity-id="order._id"
              :disabled="isTrashView"
              :options="orderStatusOption"
              @change="emit('status-change', { order, newStatus: $event })"
            />
          </div>
        </td>

        <!-- Action Icons -->
        <td data-label="Actions" class="py-3 px-5 text-right">
      
          <div class="flex items-center justify-end gap-2 text-slate-400">
            <!-- View Button -->
            <button
              @click="emit('view-details', { id: order._id })"
              class="hover:text-black/70 text-black/90 cursor-pointer p-1 transition"
              title="View Details"
            >
              <i class="ri-eye-line text-base"></i>
            </button>

            <!-- Delete Button -->
            <button
              @click="emit('delete-order', { id: order._id, tranId: order.tran_id })"
              :disabled="isTrashView"
              class="p-1 transition text-red-600"
              :class="isTrashView ? 'opacity-40 cursor-not-allowed' : 'hover:text-rose-700 cursor-pointer'"
              title="Cancel Order"
            >
              <i class="ri-delete-bin-line text-base"></i>
            </button>
          </div>
        </td>
      </tr>

      <!-- Empty State -->
      <tr v-else>
        <td colspan="7" class="py-30 text-center text-black/90 dark:text-slate-200 text-xs">
          <i class="ri-search-line"></i> No orders match your search criteria.
        </td>
      </tr>
    </tbody>
  </table>
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
    align-content: start;
    gap: 0.625rem;
    padding: 0.75rem;
  }

  tbody > tr.mobile-list-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    overflow: visible;
    border: 1px solid rgb(148 163 184 / 0.4);
    border-radius: 0.625rem;
    background: white;
    box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
  }

  tbody > tr:not(.mobile-list-row) {
    display: block;
  }

  td {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem 0.875rem;
    overflow-wrap: anywhere;
    text-align: left;
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

  td[data-label='Order'] {
    grid-column: 1 / -1;
    grid-row: 1;
    border-bottom: 1px solid rgb(148 163 184 / 0.25);
  }

  td[data-label='Items'] {
    grid-column: 1 / -1;
    grid-row: 2;
    border-bottom: 1px solid rgb(148 163 184 / 0.25);
  }

  td[data-label='Payment'] {
    grid-column: 1;
    grid-row: 3;
  }

  td[data-label='Date'] {
    grid-column: 2;
    grid-row: 3;
  }

  td[data-label='Total'] {
    grid-column: 1;
    grid-row: 4;
  }

  td[data-label='Status'] {
    grid-column: 2;
    grid-row: 4;
  }

  td[data-label='Actions'] {
    grid-column: 1 / -1;
    grid-row: 5;
    border-top: 1px solid rgb(148 163 184 / 0.25);
  }

  td[data-label='Items'] > div {
    min-width: 0;
    max-width: 100%;
  }

  td[data-label='Items'] span {
    max-width: calc(100vw - 8rem);
  }

  td[data-label='Status'] > div {
    justify-content: flex-start;
  }

  td[data-label='Status'] :deep(.mobile-order-status) {
    width: 112px;
  }

  td[data-label='Status'] :deep(.mobile-order-status > button) {
    width: 112px;
  }

  td[data-label='Status'] :deep(.mobile-order-status > button > span) {
    white-space: nowrap;
  }

  td[data-label='Status'] :deep(.mobile-order-status > div) {
    width: 112px;
  }

  td[data-label='Payment'] .mobile-payment-status {
    display: inline-flex;
    width: 112px;
    min-height: 28px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  td[data-label='Actions'] {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    text-align: left;
  }

  td[data-label='Actions']::before {
    flex-basis: 100%;
  }

  td[data-label='Actions'] > div {
    justify-content: flex-start;
  }
}
</style>
