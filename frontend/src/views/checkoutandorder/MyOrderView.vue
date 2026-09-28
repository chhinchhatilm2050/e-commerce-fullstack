<script setup lang="ts">
  import { onMounted, ref, watchEffect } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore';
  import { useAlert } from '@/composables/useAlert';
  import type { IProductImage } from '@/types/product';
  import TopLoader from '@/components/common/TopLoader.vue';

  const router = useRouter();
  const orderStore = useOrderStore();
  const { showAlert } = useAlert();

  const isCancel = ref<boolean>(false);

  onMounted(() => {
    orderStore.fetchMyorder();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'APPROVED':
    case 'DELIVERED':
    case 'SHIPPED':
      return 'border border-emerald-800 text-emerald-800  dark:text-emerald-400';
    case 'PENDING':
      return 'border-amber-800/50 border text-amber-800 dark:border-amber-900/30 dark:text-amber-400';
    case 'CANCELLED':
    case 'FAILED':
      return 'border border-rose-800 text-rose-800 dark:border-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPaymentBadgeClass = (paymentStatus: string) => {
    switch (paymentStatus) {
    case 'PAID':
      return ' text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'UNPAID':
      return ' text-amber-600 dark:text-amber-400 border border-amber-500/20';
    case 'FAILED':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
    }
  };

  const orderID = ref<string | null>(null);

  const CancelOrder = async (orderId: string) => {
    isCancel.value = true;
    orderID.value = orderId;
  };

  const handleCancelOrder  = async() => {
    try {
      const res = await orderStore.cancelOrder(orderID.value);
      if (res.success) {
        showAlert('Order cancelled successfully', { type: 'success' });
        await orderStore.fetchMyorder();
        isCancel.value = false;
      }
    } catch {
      showAlert(orderStore.error || 'Failed to cancel order', { type: 'error' });
    }
  };

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

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      isCancel.value = false;
    }
  };

  watchEffect(() => {
    if (isCancel.value === true) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  });
</script>

<template>
  <TopLoader :is-loading="orderStore.loading" />
  <div class="container-xl mx-auto md:px-9 px-5 space-y-5 md:py-5 py-3">
    <div class="flex justify-between ">
      <h1 v-if="orderStore.orders.length > 0" class="text-lg font-bold mb-3 animate-slide-up">
        <i class="ri-stack-line"></i> My Orders ({{ orderStore.orders.length }} Placed orders)
      </h1>
      <h1 v-if="orderStore.orders.length > 0" class="text-lg font-bold mb-3 animate-slide-up hidden sm:block">
        <i class="ri-hearts-fill"></i> Big thanks for your orders, Have a good day!
      </h1>
    </div>

    <!-- Loading Skeletons -->
    <div v-if="orderStore.loading" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="h-44 bg-gray-200 dark:bg-surface-700 animate-pulse"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="orderStore.error" class="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
      {{ orderStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="orderStore.orders.length === 0" class="text-center py-12">
      <i class="ri-shopping-bag-line text-5xl"></i>
      <p class="mt-2 text-lg">No orders placed yet.</p>
    </div>

    <!-- Order List Cards -->
    <div v-else class="grid grid-cols-1 -mt-4 lg:grid-cols-2 gap-6 animate-slide-up">
      <div
        v-for="order in orderStore.orders"
        :key="order._id"
        class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-4 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow"
      >
        <div class="animate-slide-up">
          <!-- Card Header -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-surface-700">
            <div>
              <span class="font-semibold text-gray-900 dark:text-white text-sm">#{{ order.tran_id }}</span>
              <span class="text-xs text-black/60 dark:text-white/60 block mt-0.5">
                Date: {{ new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) }}
              </span>
            </div>
            <!-- Order Logistics Status Badge -->
            <span :class="['px-2.5 py-1 text-xs font-bold uppercase tracking-wider', getStatusBadge(order.status)]">
              {{ order.status }}
            </span>
          </div>

          <!-- First 2 Items Preview -->
          <div class="space-y-2">
            <div
              v-for="item in order.items.slice(0, 2)"
              :key="item.productId"
              class="flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img :src="getImageUrl(item.image)" class="w-12 h-12 object-cover bg-gray-100 shrink-0" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium truncate text-black dark:text-white">{{ item.name }}</span>
                  <span v-if="item.color" class="text-xs font-medium truncate capitalize">Color: <span class="text-black dark:text-white">{{ item.color }}</span></span>
                  <span v-if="item.size" class="text-xs font-medium truncate">Size: <span class="text-black dark:text-white">{{ item.size }}</span></span>
                </div>
              </div>
              <span class="text-xs text-black/80 dark:text-white/80 font-medium whitespace-nowrap">x{{ item.quantity }}</span>
            </div>

            <!-- Indicator for Extra Items -->
            <p v-if="order.items.length > 2" class="text-xs font-medium text-black dark:text-white pt-1">
              +{{ order.items.length - 2 }} more item{{ order.items.length - 2 > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="mt-4 pt-3 border-t border-gray-100 dark:border-surface-700 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-sm">
  
        <!-- Top Mobile Row: Payment & Total Amount -->
        <div class="flex items-center justify-between sm:justify-start sm:gap-20 w-full sm:w-auto">
          <!-- Payment Info -->
          <div>
            <span class="text-xs text-black/70 dark:text-white/70 block mb-0.5">Payment</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-gray-900 dark:text-white uppercase">
                {{ order.paymentMethod }}
              </span>
              <!-- Payment Financial Status Badge -->
              <span :class="['px-1.5 py-0.5 text-[10px] font-extrabold  uppercase tracking-wider', getPaymentBadgeClass(order.paymentStatus)]">
                {{ order.paymentStatus }}
              </span>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="text-right flex justify-center items-center flex-col sm:text-left">
            <span class="text-xs text-black/70 dark:text-white/70 block mb-0.5">Total Amount</span>
            <span class="text-base font-bold text-gray-900 dark:text-white">${{ order.amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Bottom Mobile Row: Full-width Cancel Button (Mobile) / Right-aligned (Desktop) -->
        <div  class="w-full flex sm:w-auto mt-1 sm:mt-0 gap-2">
          <button v-if="order.status === 'PENDING'"
            @click.stop="CancelOrder(order._id)"
            class="w-full sm:w-auto px-4 py-1.5 sm:py-1 text-xs font-semibold text-red-600 dark:text-red-400 shadow-sm bg-white dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded transition-colors text-center cursor-pointer"
          >
            Cancel Order
          </button>
          <button
            @click="router.push(`/order-detail/${order._id}`)"
            class="w-full sm:w-auto px-4 py-1.5 sm:py-1 text-xs font-semibold subCategory-button bg-black/80"
          >
            View Details
          </button>
        </div>

      </div>
      </div>
    </div>
  </div>
  <div v-if="isCancel" @click="handleBackdropClick"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class=" animate-slide-up">
      <div  class="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Are you sure you want to cancel this order?</h3>
        <div class="flex justify-center gap-3 pt-2">
          <!-- Emits close event so parent resets both isModalOpen and deleteOpen -->
          <button @click="isCancel = false"  class="w-full subCategory-button px-4 py-1.5 bg-white border border-black/10 text-red-600 text-sm">
            Cancel
          </button>
          <button @click="handleCancelOrder" class="w-full subCategory-button px-4 py-1.5 text-sm">
            Yes
          </button>
        </div>
      </div>
    </div>
  </div>

</template>
