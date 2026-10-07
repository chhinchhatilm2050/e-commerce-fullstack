<script setup lang="ts">
  import type { IOrder } from '@/types/iorder';
  import { computed, watchEffect } from 'vue';
  import type { IProductImage } from '@/types/product';
  import { CAMBODIA_LOCATIONS } from '@/data/cambodiaLocations';
  export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }

  const props = defineProps<{
    isOpen: boolean;
    order: IOrder | null;
  }>();

  const emit = defineEmits(['close']);

  const formattedAddressString = computed(() => {
    const shippingAddress = props.order?.shippingAddress;
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

  watchEffect(() => {
    if (props.isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && props.order"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      @click.self="emit('close')"
    >
      <div 
        class="bg-white animate-slide-up rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up"
      >
        <!-- Modal Header -->
        <div class="px-6 pt-7 py-4 border-b border-slate-200  flex items-center justify-between bg-[#cdd0d5]/70 ">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-black/90">
                {{ props.order.tran_id }}
              </h3>
              <span
                class="px-2.5 py-0.5 rounded-md text-[12px] font-semibold border border-black/30 text-black/80"
              >
                {{ props.order.status }}
              </span>
            </div>
            <p class="text-xs text-black/60  mt-0.5">
              Placed on: {{ new Date(props.order.createdAt).toLocaleDateString('en-US', { dateStyle: 'full' }) }}
            </p>
          </div>

          <button 
            @click="emit('close')" 
            class="text-black/50 bg-[#cdd0d5]/70 rounded-md hover:text-slate-600  transition p-1 cursor-pointer"
          >
            <i class="ri-close-line text-xl"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 overflow-y-auto space-y-6 text-sm">

          <div>
            <div class="divide-y divide-slate-100 dark:divide-surface-700">
              <div 
                v-for="item in props.order.items" 
                :key="item.code"
                class="py-3 flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-4 min-w-0">
                  <img
                    :src="getImageUrl(item.image)"
                    :alt="item.name"
                    class="w-18 h-22 object-cover bg-gray-100 shrink-0"
                  />
                  <div class="truncate">
                    <p class="text-sm font-semibold truncate capitalize text-black/90">{{ item.name }}</p>
                    <p class="text-xs text-black/60  mt-0.5">Qty: {{ item.quantity }}</p>
                    <p v-if="item.size" class="text-xs text-black/60 mt-0.5">Size: {{ item.size }}</p>
                    <p v-if="item.color" class="text-xs text-black/60  mt-0.5 capitalize">Color: {{ item.color }}</p>
                    <p v-if="item.code" class="text-xs text-black/60  mt-0.5 capitalize">Code: {{ item.code }}</p>
                  </div>
                </div>

                <div class="text-right whitespace-nowrap">
                  <p class="text-sm text-red-700 font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                  <p class="text-xs text-black/60 dark:text-white/60">${{ item.price.toFixed(2) }} Each</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Customer Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-sm bg-[#cdd0d5]/30">
            <div>
              <p class="text-sm text-black/90 font-semibold">Customer Details</p>
              <p class=" text-black/70  mt-1">{{ props.order.shippingAddress?.firstName }} {{ props.order.shippingAddress?.lastName }}</p>
              <p class="text-black/70  ">{{ props.order.shippingAddress?.phoneNumber }}</p>
            </div>
            <div>
              <p class="text-sm text-black/90 font-semibold">Shipping Address</p>
              <p class="text-black/70  mt-1">{{ formattedAddressString }}</p>
            </div>
          </div>

          <!-- Items List -->
          
          <div>
            <div class="grid grid-cols-1 gap-2 p-3 rounded-sm bg-[#cdd0d5]/30 /50">
              <div class="text-sm space-y-2 pt-1">
              <p class="flex justify-between"><span class="text-black/90 font-medium/70">Payment Method</span> <span class="font-semibold uppercase text-black/90">{{props.order.paymentMethod }}</span></p>
              <p class="flex justify-between"><span class="text-black/90 font-medium/70">Payment Status</span> <span class="font-semibold uppercase text-black/90">{{props.order.paymentStatus}}</span></p>
              <p v-if="props.order.customer" class="flex text-black/90 justify-between"><span class="text-black/90 font-medium/70">Phone number</span> {{ props.order.customer.phoneNumber }}</p>
              <p v-if="props.order.customer?.preferredContactMethod" class="flex justify-between text-black/90"><span class="text-black/90 font-medium/70">Contact Method</span> {{ props.order.customer?.preferredContactMethod }}</p>
            </div>
            </div>
          </div>

          <!-- Pricing Breakdown -->
          <div class="rounded-sm p-3 bg-[#cdd0d5]/30 dark:border-surface-700 pt-4 space-y-2">
            <div class="flex justify-between text-slate-500 ">
              <span class="text-black">Subtotal</span>
              <span class="text-black">${{ props.order.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-slate-500 ">
              <span class="text-black">Shipping Fee</span>
              <span class="text-black">${{ props.order.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-slate-800 pt-2 border-slate-100 dark:border-surface-700">
              <span>Total Paid</span>
              <span class="text-red-700">${{ props.order.amount.toFixed(2) }}</span>
            </div>
          </div> 
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3  border-slate-200 dark:border-surface-700 flex justify-end bg-[#cdd0d5]/70">
          <button 
            @click="emit('close')"
            class="subCategory-button text-sm py-1.5 bg-[#cdd0d5] text-black cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
