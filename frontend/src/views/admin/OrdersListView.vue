<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import OrderrDetailModel from '@/components/admin/orderSession/OrderrDetailModel.vue';
  import OrderMetricsCard from '@/components/admin/orderSession/OrderMetricsCard.vue';
  import OrderListTable from '@/components/admin/orderSession/OrderListTable.vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import { useOrderStore } from '@/stores/orderStore';
  import type { IOrder } from '@/types/iorder';
  import { useAlert } from '@/composables/useAlert';

  const orderStore = useOrderStore();

  // Local Filters State
  const searchInput = ref('');
  const activeSearchQuery = ref('');
  const selectedStatusFilter = ref<string>('All Status');
  const selectedPaymentStatusFilter = ref<string>('All Payment');
  const { showAlert } = useAlert();
  // Modal State
  const isModalOpen = ref(false);
  const selectedOrder = ref<IOrder | null>(null);

  onMounted(async () => {
    await orderStore.getOrderStatus();
  });

  // Load Orders with API Filters
  const loadOrders = async () => {
    const params: Record<string, string> = {};

    if (selectedStatusFilter.value !== 'All Status') {
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

  // Trigger explicit search
  const handleSearch = () => {
    activeSearchQuery.value = searchInput.value;
    loadOrders();
    searchInput.value = '';
  };

  // Auto-refetch when filters change
  watch([selectedStatusFilter, selectedPaymentStatusFilter], () => {
    loadOrders();
  });

  onMounted(() => {
    loadOrders();
  });

  // Access orders from Pinia store
  const orders = computed(() => orderStore.adminOrders || []);

  // Modal Handler
  const handleOpenModal = async(id: { id: string; }) => {
    await orderStore.fetchOrderDetail(id.id);
    selectedOrder.value =  orderStore.currentOrder;
    isModalOpen.value = true;
  };

  // Update Order Status Handler
  const handleStatusChange = async ({ order, newStatus }: { order: IOrder; newStatus: string }) => {
    const previousStatus = order.status;
    try {
      order.status = newStatus;
      await orderStore.updateOrderStatus(order._id, newStatus);
      showAlert('Status change successfully', { type: 'success' });
    } catch  {
      order.status = previousStatus;
    }
  };

  const searchDisable = ref<boolean>(true);
  watch(searchInput, (newValue) => {
    searchDisable.value = false;
    if (newValue === '') {
      searchDisable.value = true;
    }
  });

  const idTodelete = ref<string | null>(null);
  const tranIdToDelete = ref<string | null>(null);

  const handleGetIdTodelete = ({ id, tranId }: { id: string; tranId: string }) => {
    idTodelete.value = id ;
    tranIdToDelete.value = tranId;
    isDeleteOpen.value = true;
  };

  // Delete / Cancel Order Handler
  const handleDeleteOrder = async () => {
    const result = await orderStore.deleteOrder(idTodelete.value, tranIdToDelete.value);
    if (result?.success) {
      orderStore.fetchAllOrdersAdmin();
      showAlert(result.message, { type: 'success' });
      isDeleteOpen.value = false;
      idTodelete.value = null;
      tranIdToDelete.value = null;
    }
  };

  const handleRefresh = async () => {
    await loadOrders();
    await orderStore.getOrderStatus();
  };

  const paymentStatusOption = [
    { label: 'All Payment', value: 'All Payment' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Refunded', value: 'REFUNDED' },
    { label: 'Failed', value: 'FAILED' },
  ];

  const orderStatusOption = [
    { label: 'All Status', value: 'All Status' },
    { label: 'PENDING', value: 'Pending' },
    { label: 'SHIPPED', value: 'Shipped' },
    { label: 'DELIVERED', value: 'Delivered' },
    { label: 'CANCELLED', value: 'Cancelled' },
  ];

  const isDeleteOpen = ref<boolean>(false);
  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      isDeleteOpen.value = false;
    }
  };
</script>

<template>
  <div class="space-y-6 font-sans text-slate-800 dark:text-slate-100 animate-slide-up">
    <!-- Header Title & Refresh -->
    <div class="bg-[#cdd0d5]/70 text-white p-6 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-serif font-bold text-black/80">
          <i class="ri-shopping-bag-3-line text-black/80"></i> Orders
        </h1>
        <p class="text-xs text-black/80 mt-1">Review and manage all orders placed by customers</p>
      </div>

      <button
        @click="handleRefresh"
        :disabled="orderStore.loading"
        class="hidden sm:flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50"
      >
        <i class="ri-refresh-line" :class="{ 'animate-spin': orderStore.loading }"></i>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <OrderMetricsCard :value="orderStore.orderStatusStats.total" label="Total Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.pending" label="Pending Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.delivered" label="Delivered Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.shipped" label="Shipped Orders" />
      <OrderMetricsCard :value="orderStore.orderStatusStats.cancelled" label="Canceled Orders" />
    </div>

    <!-- Filters Row -->
    <div class="p-4 bg-[#cdd0d5]/70  rounded-md shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3 items-center">
        <div class="flex items-center gap-2 flex-1 w-full">
          <div class="relative flex-1">
            <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50 dark:text-black/50 text-sm"></i>
            <input
              v-model="searchInput"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Search by transaction ID or order Date..."
              class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-white/50 border-slate-200 dark:border-surface-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#cdd0d5] dark:focus:ring-black/50 dark:placeholder-zinc-950/50"
            />
          </div>
          <button
            @click="handleSearch"
            :disabled="searchDisable"
            class="px-3  py-2 subCategory-button text-xs shrink-0 rounded-sm bg-black/80 text-white"
          >
            Search
          </button>
        </div>
  
        <div class="w-full md:w-48">
          <BaseDropdown v-model="selectedPaymentStatusFilter" :options="paymentStatusOption" />
        </div>
  
        <div class="w-full md:w-48">
          <BaseDropdown v-model="selectedStatusFilter" :options="orderStatusOption"/>
        </div>
      </div>
    </div>

    <!-- Orders Table Component -->
    <OrderListTable
      :orders="orders"
      :loading="orderStore.loading"
      @view-details="handleOpenModal"
      @delete-order="handleGetIdTodelete"
      @status-change="handleStatusChange"
    />

    <!-- Reusable Order Detail Modal -->
    <OrderrDetailModel
      :is-open="isModalOpen"
      :order="selectedOrder"
      @close="isModalOpen = false"
    />
  </div>
    <div v-if="isDeleteOpen" @click="handleBackdropClick"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class=" animate-slide-up">
      <div  class="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Are you sure you want to delete this order?</h3>
        <div class="flex justify-center gap-3 pt-2">
          <!-- Emits close event so parent resets both isModalOpen and deleteOpen -->
          <button @click="isDeleteOpen = false"  class="w-full subCategory-button px-4 py-1.5 bg-white border border-black/10 text-red-600 text-sm">
            Cancel
          </button>
          <button @click="handleDeleteOrder" class="w-full subCategory-button px-4 py-1.5 text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
