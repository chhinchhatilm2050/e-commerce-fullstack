<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useCartStore } from '@/stores/cartStore';
  import { useAuthStore } from '@/stores/authStore';
  import { useAddressStore } from '@/stores/address';
  import { CAMBODIA_LOCATIONS } from '@/data/cambodiaLocations';
  import CheckoutCartItems from '@/components/checkout/CheckoutCartItems.vue';
  import { useAlert } from '@/composables/useAlert';
  import AddressModal, { type AddressData } from '@/components/checkout/AddressModal.vue';
  import type {  IAddress, IAddressPayload } from '@/types/address';
  import TopLoader from '@/components/common/TopLoader.vue';

  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const addressStore = useAddressStore();
  const { showAlert } = useAlert();

  const isModalOpen = ref(false);
  const selectedPaymentMethod = ref<'KHQR_BAKONG' | 'COD'>('KHQR_BAKONG');
  const deliveryFee = ref<number>(1);

  const activeAddress = computed<AddressData | null>(() => {
    const raw = addressStore.address as ( IAddress | null);
    if (!raw || (!raw.province && !raw.provinceId)) return null;

    return {
      firstName: raw.firstName || raw.firstName || '',
      lastName: raw.lastName || raw.lastName || '',
      phoneNumber: raw.phoneNumber || raw.phoneNumber || '',
      provinceId: raw.province || raw.provinceId || '',
      districtId: raw.district || raw.districtId || '',
      communeId: raw.commune || raw.communeId || '',
      streetAddress: raw.streetAddress || '',
    };
  });

  const originalTotal = computed(() => cartStore.originalTotal);
  const totalSaving = computed(() => cartStore.totalSavings);
  const amountToPay = computed(() => {
    return (originalTotal.value - totalSaving.value) + deliveryFee.value;
  });

  const modalInitialData = computed<AddressData | null>(() => {
    return activeAddress.value || {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      provinceId: '',
      districtId: '',
      communeId: '',
      streetAddress: '',
    };
  });

  const formattedAddressString = computed(() => {
    if (!activeAddress.value) return '';

    const { provinceId, districtId, communeId } = activeAddress.value;
    const province = CAMBODIA_LOCATIONS.find((p) => p.id === provinceId);
    const district = province?.districts.find((d) => d.id === districtId);
    const commune = district?.communes.find((c) => c.id === communeId);

    const parts = ['Cambodia'];
    if (province) parts.push(`${province.name}, ${province.nameKh}`);
    if (district) parts.push(`${district.name}, ${district.nameKh}`);
    if (commune) parts.push(`${commune.name}, ${commune.nameKh}`);

    return parts.join(' / ');
  });

  onMounted(async () => {
    if (authStore.isLoggedIn) {
      await cartStore.fetchCart(true);
    }
    await addressStore.fetchMyAddress();
  });

  const handleSaveAddress = async (formData: AddressData) => {
    const payload: IAddressPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      province: formData.provinceId,
      district: formData.districtId,
      commune: formData.communeId,
      streetAddress: formData.streetAddress,
    };

    const result = await addressStore.saveMyAddress(payload);
    if (result?.success) {
      isModalOpen.value = false;
      showAlert( result.message , { type: 'success' });
    }
  };

  const handleDeleteAddress = async () => {
    const result = await addressStore.deleteMyAddress();
    if (result?.success) {
      isModalOpen.value = false;
      showAlert( result.message , { type: 'success' });
    }
  };

</script>

<template>
  <div class="min-h-screen">
    <TopLoader :is-loading="cartStore.removeCartLoading || cartStore.updateCartLoading || addressStore.loading" />
    <!-- Header Logo -->
    <RouterLink to="/" class="cursor-pointer shadow-sm bg-white z-40 flex items-center justify-center pt-4 fixed left-0 right-0 top-0 pb-3">
      <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] block dark:hidden" src="../assets/image/torilogo.png" alt="Logo" />
      <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] hidden dark:block" src="../assets/image/torilogowhite.png" alt="Logo" />
    </RouterLink>

    <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10 lg:mt-20 animate-slide-up">
      
      <!-- LEFT COLUMN -->
      <div class="lg:col-span-6 space-y-6">
        <div>
          <h2 class="text-base font-bold text-gray mb-2">Shipping Address</h2>
          
          <div v-if="addressStore.loading" class="p-4 bg-gray-100 rounded-md animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>

          <div v-else-if="activeAddress" class="bg-gray-100 p-4 rounded-md flex justify-between items-start">
            <div class="space-y-1 text-sm text-gray-800">
              <p class="font-bold text-base capitalize">{{ activeAddress.firstName }} {{ activeAddress.lastName }}</p>
              <p class="text-gray-600">{{ formattedAddressString }}</p>
              <p class="text-gray-600">Tel : {{ activeAddress.phoneNumber }}</p>
              <p v-if="activeAddress.streetAddress" class="text-gray-600">
                {{ activeAddress.streetAddress }}
              </p>
            </div>
            <button @click="isModalOpen = true" class="text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-1">
              Change 
            </button>
          </div>

          <div v-else class="border border-black/10 shadow-md p-9.5 rounded-sm text-center bg-white space-y-3">
            <p class="text-gray-600 text-sm">No delivery address selected yet.</p>
            <button @click="isModalOpen = true" class="subCategory-button px-4 py-2 text-sm font-medium">
              + Add Address
            </button>
          </div>
        </div>

        <CheckoutCartItems />
      </div>

      <!-- RIGHT COLUMN -->
      <div class="lg:col-span-6 space-y-2">
        <h2 class="font-bold text-gray-900">Payment Method</h2>
        <div class="rounded-md space-y-6">

          <label class="flex items-center gap-3 p-3 bg-white rounded border border-black/10 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200">
            <input type="radio" value="KHQR_BAKONG" v-model="selectedPaymentMethod" class="w-4 h-4 text-black" />
            <div class="w-10 h-8 bg-red-600 text-white rounded font-bold text-[10px] flex items-center justify-center">KHQR</div>
            <div>
              <p class="font-bold text-sm">KHQR Bakong</p>
              <p class="text-xs text-gray-500">Scan to pay with any banking app</p>
            </div>
          </label>

          <label class="flex items-center gap-3 p-3 bg-white rounded border border-black/10 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200">
            <input type="radio" value="COD" v-model="selectedPaymentMethod" class="w-4 h-4 text-black" />
            <div class="w-10 h-8 bg-gray-800 text-white rounded font-bold text-[10px] flex items-center justify-center">COD</div>
            <div>
              <p class="font-bold text-sm">Cash on Delivery</p>
              <p class="text-xs text-gray-500">Pay cash upon package arrival</p>
            </div>
          </label>

          <div class="bg-white shadow-lg text-black p-6 rounded-md space-y-3 font-sans">
            <div class="flex justify-between items-center text-base">
              <span class="font-semibold">Total</span>
              <span class="font-semibold">${{ originalTotal.toFixed(2) }}</span>
            </div>

            <div  class="flex justify-between items-center text-sm">
              <span class="font-semibold">Save</span>
              <span class="font-semibold text-black/80">-${{ totalSaving.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="font-semibold">Delivery fee</span>
              <span class="font-semibold text-black/80">${{ deliveryFee.toFixed(2) }}</span>
            </div>

            <hr class="border-gray-700 my-2" />

            <div class="flex justify-between items-center text-md font-bold pt-1">
              <span>Amount to pay</span>
              <span class="text-red-600">${{ amountToPay.toFixed(2) }}</span>
            </div>
          </div>

          <button class="w-full py-3 rounded-sm font-semibold bg-black/90 dark:border border-white/30 text-white hover:bg-black/80 transition-colors cursor-pointer disabled:opacity-50">
            Proceed to Checkout
          </button>
          <img class="h-64 w-full" src="https://i.pinimg.com/1200x/a9/93/93/a9939394ef52e0b65571f4870fb890b5.jpg" alt="">
        </div>
      </div>

    </div>

    <AddressModal 
      :is-open="isModalOpen"
      :initial-data="modalInitialData"
      @close="isModalOpen = false"
      @save="handleSaveAddress"
      @delete="handleDeleteAddress"
    />
  </div>
</template>
