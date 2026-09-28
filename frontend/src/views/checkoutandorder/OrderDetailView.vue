<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore';
  import type { IProductImage } from '@/types/product';
  import { CAMBODIA_LOCATIONS } from '@/data/cambodiaLocations';
  import TopLoader from '@/components/common/TopLoader.vue'; 

  const route = useRoute();
  const router = useRouter();
  const orderStore = useOrderStore();

  const orderId = route.params.id as string;

  onMounted(async () => {
    if (orderId) {
      await orderStore.fetchOrderDetail(orderId);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'APPROVED':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'PENDING':
      return 'border border-amber-700 text-amber-700 dark:text-amber-400';
    case 'FAILED':
      return 'text-rose-700 dark:text-rose-400';
    default:
      return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getImageUrl = (image: string | IProductImage): string => {
    if (!image) return '/placeholder.png';
    if (typeof image === 'string' && image.startsWith('http')) return image;
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

  // Formatted Cambodian address computed property using CAMBODIA_LOCATIONS lookup
  const formattedAddressString = computed(() => {
    const shippingAddress = orderStore.currentOrder?.shippingAddress;
    if (!shippingAddress) return '';

    const provinceId = shippingAddress.province;
    const districtId = shippingAddress.district;
    const communeId =  shippingAddress.commune;

    const province = CAMBODIA_LOCATIONS.find((p) => String(p.id) === String(provinceId));
    const district = province?.districts.find((d) => String(d.id) === String(districtId));
    const commune = district?.communes.find((c) => String(c.id) === String(communeId));

    const parts = ['Cambodia'];
    if (province) parts.push(`${province.name}, ${province.nameKh}`);
    if (district) parts.push(`${district.name}, ${district.nameKh}`);
    if (commune) parts.push(`${commune.name}, ${commune.nameKh}`);

    return parts.join(' / ');
  });

  const getPaymentBadgeClass = (paymentStatus: string) => {
    switch (paymentStatus) {
    case 'PAID':
      return ' text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'UNPAID':
      return ' border border-amber-700 text-amber-700 dark:text-amber-400';
    case 'FAILED':
      return 'border border-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    default:
      return 'border bordergray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
    }
  };
</script>

<template>
  <TopLoader :is-loading="orderStore.orderDetailLoading" />
  <div class="container-xl mx-auto px-5 md:px-9 md:py-5 py-3 md:space-y-4 space-y-3">
    <!-- Back Navigation -->
     <div class="flex justify-between">
       <h2 class="font-bold text-2xl animate-slide-up"><i class="ri-game-2-line animate-slide-up"></i> Your Order Details</h2>
       <button
           @click="router.back()"
           class="subCategory-button text-sm animate-slide-up "
         >
           <i class="ri-arrow-left-line text-md"></i> Back to Orders
         </button>
     </div>
    <div class="md:flex justify-between block gap-4 items-cente animate-slide-up">
      <div class="">
        <p class="font-semibold capitalize">
          Hello, {{ orderStore.currentOrder?.shippingAddress?.firstName }} {{ orderStore.currentOrder?.shippingAddress?.lastName }}
        </p>
        <p class="text-xs">Thank you. Your order has been Confirmed.</p>
      </div>
      
    </div>

    <!-- Loading State -->
    <div v-if="orderStore.loading" class="space-y-4 animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-surface-700  w-1/3"></div>
      <div class="h-40 bg-gray-200 dark:bg-surface-700 "></div>
      <div class="h-60 bg-gray-200 dark:bg-surface-700 "></div>
    </div>

    <!-- Error State -->
    <div v-else-if="orderStore.error" class="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
      {{ orderStore.error }}
    </div>

    <!-- Order Details Card -->
    <div v-else-if="orderStore.currentOrder" class="space-y-6 animate-slide-up">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Order Header -->
        <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 class="text-xl font-bold flex items-center gap-2">
              Order #{{ orderStore.currentOrder.tran_id }}
            </h1>
            <p class="text-xs text-black/60 dark:text-white/60 mt-1">
              Placed on {{ new Date(orderStore.currentOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'full' }) }}
            </p>
          </div>
          <span :class="['px-3 py-1 text-xs font-semibold', getStatusBadge(orderStore.currentOrder.status)]">
            {{ orderStore.currentOrder.status }}
          </span>
        </div>
        <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 class="text-xl font-bold flex items-center gap-2">Payment Method</h1>
            <p class="text-sm font-bold text-gray-900 dark:text-white uppercase">
              {{ orderStore.currentOrder.paymentMethod }}
            </p>
          </div>
           <span :class="['px-3 py-1 text-xs font-semibold', getPaymentBadgeClass(orderStore.currentOrder.paymentStatus)]">
            {{ orderStore.currentOrder.paymentStatus }}
          </span>
        </div>
      </div>

      <!-- Items Section -->
      <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md space-y-4">
        <h2 class="text-base font-bold border-b pb-3 border-gray-100 dark:border-surface-700">
          Order Items ({{ orderStore.currentOrder.items.length }})
        </h2>

        <div class="divide-y divide-gray-100 dark:divide-surface-700">
          <div
            v-for="item in orderStore.currentOrder.items"
            :key="item.productId"
            class="py-4 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4 min-w-0">
              <img
                :src="getImageUrl(item.image)"
                :alt="item.name"
                class="w-18 h-18 object-cover bg-gray-100 shrink-0"
              />
              <div class="truncate">
                <p class="text-sm font-semibold truncate">{{ item.name }}</p>
                <p class="text-xs text-black/60 dark:text-white/60 mt-0.5">Qty: {{ item.quantity }}</p>
                <p v-if="item.size" class="text-xs text-black/60 dark:text-white/60 mt-0.5">Size: {{ item.size }}</p>
                <p v-if="item.color" class="text-xs text-black/60 dark:text-white/60 mt-0.5 capitalize">Color: {{ item.color }}</p>
              </div>
            </div>

            <div class="text-right whitespace-nowrap">
              <p class="text-sm font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
              <p class="text-xs text-black/60 dark:text-white/60">${{ item.price.toFixed(2) }} Each</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md space-y-3">
        <h2 class="text-base font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-100 dark:border-surface-700">
          Shipping Address
        </h2>
        <div class="text-sm space-y-2 font-medium dark:text-white/70">
          <div class="flex justify-between">
            <span>Full name</span>
            <span class="dark:text-white">{{ orderStore.currentOrder.shippingAddress?.firstName }} {{ orderStore.currentOrder.shippingAddress?.lastName }}</span>
          </div>
          <div class="flex justify-between">
            <span>Mobile phone</span>
            <span class="dark:text-white">{{ orderStore.currentOrder.shippingAddress?.phoneNumber }}</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="shrink-0">Address</span>
            <span class="dark:text-white text-right max-w-lg">{{ formattedAddressString }}</span>
          </div>
        </div>
      </div>

      <!-- Summary & Payment Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Payment Info -->
        <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md space-y-2">
          <h2 class="text-base font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-100 dark:border-surface-700">
            Payment & Info
          </h2>
          <div class="text-sm space-y-2 pt-1">
            <p><span class="text-black/70 font-medium dark:text-white/70">Payment Method:</span> <span class="font-semibold uppercase">{{ orderStore.currentOrder.paymentMethod }}</span></p>
            <p v-if="orderStore.currentOrder.customer"><span class="text-black/70 font-medium dark:text-white/70">Phone number:</span> {{ orderStore.currentOrder.customer.phoneNumber }}</p>
            <p v-if="orderStore.currentOrder.customer?.preferredContactMethod"><span class="text-black/70 font-medium dark:text-white/70">Contact Method:</span> {{ orderStore.currentOrder.customer.preferredContactMethod }}</p>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="bg-[#cdd0d5]/60 dark:bg-surface-800 border border-black/10 dark:border-surface-700 p-6 shadow-md space-y-3">
          <h2 class="text-base font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-100 dark:border-surface-700">
            Order Summary
          </h2>
          <div class="text-sm space-y-2 font-medium dark:text-white/70">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="dark:text-white">${{ orderStore.currentOrder.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee</span>
              <span class="dark:text-white">${{ (orderStore.currentOrder.deliveryFee || 0).toFixed(2) }}</span>
            </div>
            <div v-if="orderStore.currentOrder.discountAmount" class="flex justify-between text-red-600 dark:text-red-400">
              <span>Discount</span>
              <span>-${{ orderStore.currentOrder.discountAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-surface-700">
              <span>Total Amount</span>
              <span class="text-red-600">${{ (orderStore.currentOrder.amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

