<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore'; 
  import type { IOrder } from '@/types/iorder';
  const route = useRoute();
  const router = useRouter();
  const orderStore = useOrderStore();

  const tranId = route.query.tran_id as string | undefined;
  const loading = ref(true);
  const order = ref<IOrder>();
  const errorMessage = ref<string | null>(null);

  onMounted(async () => {
    if (!tranId) {
      errorMessage.value = 'No order reference was provided.';
      loading.value = false;
      return;
    }

    try {
      const res = await orderStore.checkStatus(tranId);
      order.value = res?.order ?? null;
      if (res?.status && res.status !== 'APPROVED' && res.status !== 'PENDING') {
        errorMessage.value = 'This order could not be confirmed as paid.';
      }
    } catch {
      errorMessage.value = 'Could not load your order details.';
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 animate-slide-up">
    <div class="max-w-lg w-full text-center space-y-5">
      <div v-if="loading" class="space-y-3">
        <div class="w-10 h-10 mx-auto border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500">Confirming your order...</p>
      </div>

      <template v-else-if="errorMessage">
        <div class="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-9 h-9 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-800">Something Went Wrong</h1>
        <p class="text-sm text-gray-500">{{ errorMessage }}</p>
        <button
          @click="router.push('/')"
          class="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition-colors text-sm"
        >
          Go to Home Page
        </button>
      </template>

      <template v-else>
        <div class="w-15 h-15 mx-auto rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center shadow-lg">
          <svg class="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold">Order Confirmed</h1>
        <p class="text-md text-black/70 dark:text-white/70">
          Thank you for your purchase! Your order
          <span class="font-semibold text-black/90 dark:text-white/90">{{ tranId }}</span>
          has been placed successfully.
        </p>

        <div v-if="order" class="text-left bg-gray-50 p-6 text-md space-y-1 shadow-md border border-black/5 dark:rounded">
          <div class="flex justify-between">
            <span class="text-black/80 font-medium">Order ID</span>
            <span class="font-medium text-black">{{ order.tran_id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-black/80 font-medium">Amount</span>
            <span class="font-medium text-black">${{ Number(order.amount).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-black/80 font-medium">Status</span>
            <span class="font-medium text-green-600">{{ order.status }}</span>
          </div>
        </div>

        <div class="flex gap-3 justify-center pt-2">
          <button
            @click="router.push('/products/category/books')"
            class="subCategory-button text-sm px-4"
          >
            Continue Shopping
          </button>
          <button
            @click="router.push('/orders')"
            class="subCategory-button text-sm px-4 bg-white dark:bg-black dark:text-white text-black border border-black/10"
          >
            View My Orders
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

