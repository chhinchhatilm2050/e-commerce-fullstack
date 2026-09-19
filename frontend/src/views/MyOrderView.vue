<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore';
  import type { IProductImage } from '@/types/product';
  import TopLoader from '@/components/common/TopLoader.vue';

  const router = useRouter();
  const orderStore = useOrderStore();

  onMounted(() => {
    orderStore.fetchMyorder();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'APPROVED':
      return ' text-emerald-700 dark:text-emerald-400';
    case 'PENDING':
      return ' text-amber-700 dark:text-amber-400';
    case 'FAILED':
      return 'text-rose-700 dark:text-rose-400';
    default:
      return ' text-gray-700 dark:text-gray-300';
    }
  };

  const getImageUrl = (image: string | IProductImage): string => {
    if (!image) return '/placeholder.png';
    // If it's already a clean direct URL
    if (typeof image === 'string' && image.startsWith('http')) {
      return image;
    }
    // If it's a stringified object string containing a url
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
</script>

<template>
  <TopLoader :is-loading="orderStore.loading" />
  <div class="container-xl mx-auto md:px-9 px-5 space-y-5 md:py-6 py-3">
    <h1 v-if="orderStore.orders.length > 0" class="text-lg font-bold mb-3 animate-slide-up">
      <i class="ri-stack-line"></i> My Orders ({{
        orderStore.orders.length
      }}
      Placed orders)
    </h1>

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
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
      <div
        v-for="order in orderStore.orders"
        :key="order._id"
        @click="router.push(`/order-detail/${order._id}`)"
        class="bg-white dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-4 shadow-md flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div class="animate-slide-up">
          <!-- Card Header -->
          <div class="flex items-center justify-between pb-3 mb-3">
            <div>
              <span class="font-semibold text-gray-900 dark:text-white text-sm">#{{ order.tran_id }}</span>
              <span class="text-xs text-black/60 dark:text-white/60 block mt-0.5">
                Date: {{ new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) }}
              </span>
            </div>
            <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(order.status)]">
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
                <span class="text-sm font-medium truncate">{{ item.name }}</span>
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
        <div class="mt-4 pt-3 border-gray-100 dark:border-surface-700 flex justify-between items-end text-sm">
          <div>
            <span class="text-xs text-black/70 dark:text-white/70 block">Payment</span>
            <span class="text-md font-bold text-gray-900 dark:text-white uppercase">
              {{ order.paymentMethod }}
            </span>
          </div>

          <div class="text-right">
            <span class="text-xs text-black/70 dark:text-white/70 block">Total Amount</span>
            <span class="text-base font-bold text-gray-900 dark:text-white">${{ order.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
