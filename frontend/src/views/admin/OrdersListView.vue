<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import OrderrDetailModel from '@/components/admin/orderSession/OrderrDetailModel.vue';
  import OrderMetricsCard from '@/components/admin/orderSession/OrderMetricsCard.vue';
  import OrderListTable from '@/components/admin/orderSession/OrderListTable.vue';
  import OrderFilterBar from '@/components/admin/orderSession/OrderFilterBar.vue';
  import OrderPagination from '@/components/admin/orderSession/OrderPaginaton.vue';
  import { useOrderStore } from '@/stores/orderStore';
  import type { IOrder } from '@/types/iorder';
  import { useAlert } from '@/composables/useAlert';

  const orderStore = useOrderStore();
  const { showAlert } = useAlert();

  // Filter States
  const searchInput = ref('');
  const activeSearchQuery = ref('');
  const selectedStatusFilter = ref<string>('All Status');
  const selectedPaymentStatusFilter = ref<string>('All Payment');
  
  // Trash View State
  const isTrashView = ref(false);

  // Pagination State
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  // Modal States
  const isModalOpen = ref(false);
  const selectedOrder = ref<IOrder | null>(null);
  const isDeleteOpen = ref<boolean>(false);
  const idTodelete = ref<string | null>(null);
  const tranIdToDelete = ref<string | null>(null);

  // Filter Options
  const paymentStatusOption = [
    { label: 'All Payment', value: 'All Payment' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Refunded', value: 'REFUNDED' },
    { label: 'Failed', value: 'FAILED' },
  ];

  const orderStatusOption = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  // API Fetch
  const loadOrders = async () => {
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      isDeleted: isTrashView.value ? 'true' : 'false',
    };

    if (!isTrashView.value && selectedStatusFilter.value !== 'All Status') {
      params.status = selectedStatusFilter.value.toUpperCase();
    } 

    if (selectedPaymentStatusFilter.value !== 'All Payment') {
      params.paymentStatus = selectedPaymentStatusFilter.value.toUpperCase();
    }

    if (activeSearchQuery.value.trim()) {
      params.search = activeSearchQuery.value.trim();
    }

    await orderStore.fetchAllOrdersAdmin(params);
  };

  onMounted(async () => {
    await orderStore.getOrderStatus();
    await loadOrders();
  });

  // Watchers
  watch([selectedStatusFilter, selectedPaymentStatusFilter, isTrashView], () => {
    currentPage.value = 1;
    loadOrders();
  });

  const searchDisable = computed(() => searchInput.value.trim() === '');

  // Search Action
  const handleSearch = () => {
    activeSearchQuery.value = searchInput.value;
    currentPage.value = 1;
    loadOrders();
    searchInput.value = '';
  };

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      loadOrders();
    }
  };

  const goToNextPage = () => {
    if (currentPage.value < (orderStore.pagination?.totalPages || 1)) {
      currentPage.value++;
      loadOrders();
    }
  };

  // Handlers
  const handleRefresh = async () => {
    await loadOrders();
    await orderStore.getOrderStatus();
  };

  const handleOpenModal = async (id: { id: string }) => {
    await orderStore.fetchOrderDetail(id.id);
    selectedOrder.value = orderStore.currentOrder;
    isModalOpen.value = true;
  };

  const handleStatusChange = async ({ order, newStatus }: { order: IOrder; newStatus: string }) => {
    const previousStatus = order.status;
    try {
      order.status = newStatus;
      await orderStore.updateOrderStatus(order._id, newStatus);
      showAlert('Status changed successfully', { type: 'success' });
    } catch {
      order.status = previousStatus;
    }
  };

  const handleGetIdTodelete = ({ id, tranId }: { id: string; tranId: string }) => {
    idTodelete.value = id;
    tranIdToDelete.value = tranId;
    isDeleteOpen.value = true;
  };

  const handleDeleteOrder = async () => {
    if (!idTodelete.value || !tranIdToDelete.value) return;
    const result = await orderStore.deleteOrder(idTodelete.value, tranIdToDelete.value);
    if (result?.success) {
      await loadOrders();
      showAlert(result.message, { type: 'success' });
      isDeleteOpen.value = false;
      idTodelete.value = null;
      tranIdToDelete.value = null;
    }
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      isDeleteOpen.value = false;
    }
  };
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-96px)] gap-3 font-sans text-slate-800 dark:text-slate-100">
    <!-- Header Row -->
    <div class="bg-[#cdd0d5]/70 text-black p-4 rounded-lg shadow-2xs flex items-center justify-between shrink-0 animate-slide-up">
      <div>
        <h1 class="text-xl font-bold text-black/80 flex items-center gap-2">
          <i :class="isTrashView ? 'ri-delete-bin-line' : 'ri-shopping-bag-3-line'" class="text-black/80"></i>
          {{ isTrashView ? 'Trash Orders' : 'Orders' }}
        </h1>
        <p class="text-xs text-black/80 mt-0.5">
          {{ isTrashView ? 'Review deleted customer orders' : 'Review and manage all orders placed by customers' }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Refresh Button -->
        <button
          @click="handleRefresh"
          :disabled="orderStore.loading"
          class="hidden sm:inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <i class="ri-refresh-line text-sm leading-none" :class="{ 'animate-spin': orderStore.loading }"></i>
          <span>Refresh</span>
        </button>

        <!-- Toggle Active List / Trash Bin -->
        <div class="inline-flex rounded-md bg-white/50 p-1 border shadow-2xs border-slate-300/40">
          <button
            @click="isTrashView = false"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition flex items-center gap-1.5 cursor-pointer',
              !isTrashView ? 'bg-white text-black/80 shadow-2xs' : 'text-black/80'
            ]"
          >
            <i class="ri-list-check"></i>
            <span>Active List</span>
          </button>

          <button
            @click="isTrashView = true"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer flex items-center gap-1.5',
              isTrashView ? 'bg-red-700/80 text-white shadow-2xs' : 'text-black/80 hover:text-red-600'
            ]"
          >
            <i class="ri-delete-bin-line"></i>
            <span>Trash Bin</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0 animate-slide-up">
      <OrderMetricsCard :value="orderStore.orderStatusStats.total" label="Total Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.pending" label="Pending Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.delivered" label="Delivered Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.shipped" label="Shipped Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.cancelled" label="Canceled Orders" />
    </div>

    <!-- Extracted Filter Component -->
    <OrderFilterBar
      v-model:search-input="searchInput"
      v-model:selected-payment-status-filter="selectedPaymentStatusFilter"
      v-model:selected-status-filter="selectedStatusFilter"
      :payment-status-option="paymentStatusOption"
      :order-status-option="orderStatusOption"
      :search-disabled="searchDisable"
      @search="handleSearch"
    />

    <!-- Main Content Container with Table + Fixed Pagination Bar -->
    <div class="flex flex-col flex-1 min-h-0 bg-[#cdd0d5]/30 dark:bg-[#cdd0d5]/70 rounded-lg shadow-2xs overflow-hidden border border-slate-200/50">
      <!-- Scrollable Table Wrapper -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <OrderListTable
          :orders="orderStore.adminOrders || []"
          :loading="orderStore.loading"
          :is-trash-view="isTrashView"
          @view-details="handleOpenModal"
          @delete-order="handleGetIdTodelete"
          @status-change="handleStatusChange"
        />
      </div>

      <!-- Pagination Component Pinned to Bottom -->
      <OrderPagination
        :current-page="currentPage"
        :pagination="orderStore.pagination"
        :loading="orderStore.loading"
        class="shrink-0"
        @prev="goToPreviousPage"
        @next="goToNextPage"
      />
    </div>

    <!-- Order Detail Modal -->
    <OrderrDetailModel
      :is-open="isModalOpen"
      :order="selectedOrder"
      @close="isModalOpen = false"
    />

    <!-- Delete Modal Overlay -->
    <div
      v-if="isDeleteOpen"
      @click="handleBackdropClick"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="animate-slide-up">
        <div class="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            Are you sure you want to delete this order?
          </h3>
          <div class="flex justify-center gap-3 pt-2">
            <button
              @click="isDeleteOpen = false"
              class="w-full subCategory-button px-4 py-1.5 bg-white dark:bg-white/50 border border-black/10 text-red-600 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="handleDeleteOrder"
              class="flex items-center gap-1.5 w-full subCategory-button cursor-pointer px-4 py-1.5 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
