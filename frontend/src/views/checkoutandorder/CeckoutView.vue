<script setup lang="ts">
  import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCartStore } from '@/stores/cartStore';
  import { useAuthStore } from '@/stores/authStore';
  import { useAddressStore } from '@/stores/address';
  import { useOrderStore } from '@/stores/orderStore';
  import { CAMBODIA_LOCATIONS } from '@/data/cambodiaLocations';
  import CheckoutCartItems from '@/components/checkout/CheckoutCartItems.vue';
  import AddressModal, { type AddressData } from '@/components/checkout/AddressModal.vue';
  import AbaPaywayModal from '@/components/checkout/AbaPaywayModal.vue';
  import TopLoader from '@/components/common/TopLoader.vue';
  import { useAlert } from '@/composables/useAlert';
  import type { IAddress, IAddressPayload } from '@/types/address';
  import type { IPaywayData, ICheckoutPayload } from '@/types/iorder';
  import type { ICartItem } from '@/types/cart';
  const router = useRouter();
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const addressStore = useAddressStore();
  const orderStore = useOrderStore();
  const { showAlert } = useAlert();

  const isModalOpen = ref<boolean>(false);
  const deleteOpen = ref<boolean>(false);
  const selectedPaymentMethod = ref<'aba_payway' | 'COD'>('COD');
  const deliveryFee = ref<number>(1);

  // Preferred Contact Line State
  const phoneNumber = ref<string>('');
  const preferredContactMethod = ref<'PHONE CALL' | 'TELEGRAM'>('PHONE CALL');

  // PayWay Popup Modal State
  const isPaywayModalOpen = ref<boolean>(false);
  const paywayData = ref<IPaywayData | null>(null);
  let statusPollInterval: ReturnType<typeof setInterval> | null = null;

  const activeAddress = computed<AddressData | null>(() => {
    const raw = addressStore.address as (IAddress | null);
    if (!raw || (!raw.province && !raw.provinceId)) return null;

    return {
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      phoneNumber: raw.phoneNumber || '',
      provinceId: raw.province || raw.provinceId || '',
      districtId: raw.district || raw.districtId || '',
      communeId: raw.commune || raw.communeId || '',
      streetAddress: raw.streetAddress || '',
    };
  });

  watch(
    activeAddress,
    (newAddress) => {
      if (newAddress?.phoneNumber && !phoneNumber.value) {
        phoneNumber.value = newAddress.phoneNumber;
      }
    },
    { immediate: true },
  );

  const originalTotal = computed(() => cartStore.originalTotal);
  const totalSaving = computed(() => cartStore.totalSavings);
  const amountToPay = computed(() => originalTotal.value - totalSaving.value + deliveryFee.value);

  const modalInitialData = computed<AddressData | null>(() => {
    return (
      activeAddress.value || {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        provinceId: '',
        districtId: '',
        communeId: '',
        streetAddress: '',
      }
    );
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

  onUnmounted(() => {
    stopPolling();
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
      showAlert(result.message, { type: 'success' });
    }
  };

  const handleCloseModal = () => {
    isModalOpen.value = false;
    deleteOpen.value = false;
  };

  const handleDeleteAddress = async () => {
    handleCloseModal();
    const result = await addressStore.deleteMyAddress();
    if (result?.success) {
      showAlert(result.message, { type: 'success' });
    }
  };

  // --- Process Checkout Workflow ---
  const handleCheckout = async () => {
    if (!activeAddress.value) {
      showAlert('Please select or add a shipping address', { type: 'error' });
      return;
    }

    if (!phoneNumber.value) {
      showAlert('Please enter your contact phone number', { type: 'error' });
      return;
    }

    const payload: ICheckoutPayload = {
      items: cartStore.cartItems.map((item: ICartItem) => ({
        productId: typeof item.productId === 'object' && item.productId !== null 
          ? item.productId._id 
          : item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: selectedPaymentMethod.value,
      customer: {
        phoneNumber: phoneNumber.value,
        preferredContactMethod: preferredContactMethod.value,
      },
      shippingAddress: {
        firstName: activeAddress.value.firstName,
        lastName: activeAddress.value.lastName,
        phoneNumber: phoneNumber.value,
        province: activeAddress.value.provinceId,
        district: activeAddress.value.districtId,
        commune: activeAddress.value.communeId,
        street: activeAddress.value.streetAddress,
      },
      deliveryFee: deliveryFee.value,
    };
    try {
      const res = await orderStore.placeOrder(payload);
      // Safeguard check if store or network returns an undefined response
      if (!res) {
        throw new Error(orderStore.error || 'Server did not return a valid order response.');
      }

      if (res.paymentMethod === 'COD') {
        cartStore.clearCart();
        router.push({ path: '/order-success', query: { tran_id: res.order.tran_id } });

      } else if (res.paymentMethod === 'aba_payway') {
        if (!res.paywayData) {
          throw new Error('ABA PayWay checkout details are missing.');
        }
        paywayData.value = res.paywayData;
        isPaywayModalOpen.value = true;
        startPollingOrderStatus(res.paywayData.tran_id);
      } else {
        throw new Error('Unknown payment method response received.');
      }
    } catch {
      showAlert( orderStore.error || 'Checkout failed', { type: 'error' });
    }
  };

  const startPollingOrderStatus = (tranId: string) => {
    stopPolling();
    statusPollInterval = setInterval(async () => {
      try {
        const res = await orderStore.checkStatus(tranId);
        if (res.status === 'APPROVED') {
          stopPolling();
          isPaywayModalOpen.value = false;
          cartStore.clearCart();
          router.push(`/order-success?tran_id=${tranId}`);
        } else if (res.status === 'FAILED') {
          stopPolling();
          isPaywayModalOpen.value = false;
          showAlert('Payment failed. Please try again.', { type: 'error' });
        }
      } catch {
        // Continue polling silently
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (statusPollInterval) {
      clearInterval(statusPollInterval);
      statusPollInterval = null;
    }
  };

  const handleClosePaywayModal = () => {
    isPaywayModalOpen.value = false;
    stopPolling();
  };
</script>

<template>
  <div class="min-h-screen" >
    <TopLoader :is-loading="cartStore.removeCartLoading || cartStore.updateCartLoading || addressStore.loading || orderStore.loading" />
    
    <!-- Header Logo -->
    <div class="dark:bg-surface-800 dark:border-surface-700 shadow-sm gap-6 bg-white z-40 flex items-center justify-center pt-4 fixed left-0 right-0 top-0 pb-3" >
      <RouterLink to="/" >
        <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] cursor-pointer block dark:hidden"  src="../../assets/image/torilogo.png" alt="Logo" />
        <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] cursor-pointer hidden dark:block" src="../../assets/image/torilogowhite.png" alt="Logo" />
      </RouterLink>
      <div class="sm:text-2xl font-bold text-lg"><i class="ri-shopping-bag-line"></i> Checkout Summary</div>
    </div>

    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20 lg:mt-20 animate-slide-up">
      <!-- LEFT COLUMN -->
      <div class="lg:col-span-6 space-y-6">
        <div>
          <h2 class="text-base font-bold text-gray mb-2">Shipping Address</h2>

          <div v-if="addressStore.loading" class="p-4 bg-gray-100 rounded-md animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>

          <div v-else-if="activeAddress" class="dark:bg-surface-800 border border-black/5 shadow-md p-4 flex justify-between items-start">
            <div class="space-y-1 text-sm ">
              <p class="font-bold text-base capitalize">{{ activeAddress.firstName }} {{ activeAddress.lastName }}</p>
              <p class="">{{ formattedAddressString }}</p>
              <p class="">Tel : {{ activeAddress.phoneNumber }}</p>
              <p v-if="activeAddress.streetAddress" class="">
                {{ activeAddress.streetAddress }}
              </p>
            </div>
            <div class="flex gap-3">
              <i class="ri-delete-bin-line cursor-pointer text-red-600" @click="isModalOpen = true; deleteOpen = true"></i>
              <i class="ri-edit-line cursor-pointer dark:text-white/70" @click="isModalOpen = true; deleteOpen = false"></i>
            </div>
          </div>

          <div v-else class="border border-black/10 shadow-md p-9.5 text-center bg-white space-y-3">
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
        <h2 class="font-bold text-base">Payment Method</h2>
        <div class="space-y-6">
          <label class="flex items-center gap-3 p-3 dark:bg-surface-800 border border-black/10  cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200">
            <input type="radio" value="aba_payway" v-model="selectedPaymentMethod" class="w-4 h-4 text-black accent-black" />
            <div class="w-16 h-9 bg-red-600 text-white rounded font-bold text-[10px] flex items-center justify-center">
              <img class="w-16 h-9 rounded-sm" src="../../assets/image/aba.jpg" alt="ABA" />
            </div>
            <div>
              <p class="font-bold text-sm">ABA PAY</p>
              <p class="text-xs text-black/60 dark:text-white/60 ">Tap to pay with ABA Mobile KHQR</p>
            </div>
          </label>

          <label class="flex items-center dark:bg-surface-800  gap-3 p-3 border border-black/10 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200">
            <input type="radio" value="COD" v-model="selectedPaymentMethod" class="w-4 h-4 text-black accent-black" />
            <div class="w-16 h-9 shadow-sm text-white bg-white rounded font-bold text-[10px] flex items-center justify-center">
              <img class="w-10 h-9" src="https://i.pinimg.com/736x/e0/69/43/e06943003785c039da78f19bdf006d2e.jpg" alt="COD" />
            </div>
            <div>
              <p class="font-bold text-sm">Cash on Delivery</p>
              <p class="text-xs text-black/60 dark:text-white/60">Pay cash upon package arrival</p>
            </div>
          </label>

          <!-- PREFERRED CONTACT LINE SECTION -->
          <div>
            <h2 class="font-bold mb-2">Preferred Contact Line</h2>
            <div class="dark:bg-surface-800  shadow-md p-5 space-y-4 border border-black/5">
              <div class="flex gap-2">
                <div class="flex items-center gap-2 px-3 py-2 dark:bg-surface-800 border border-gray-300 rounded text-sm font-semibold">
                  <img src="https://flagcdn.com/w20/kh.png" alt="Cambodia Flag" class="w-5 h-3.5 object-cover rounded-xs" />
                  <span>+855</span>
                </div>
    
                <input
                  type="tel"
                  v-model="phoneNumber"
                  placeholder="Enter mobile phone"
                  class="placeholder-black/50 dark:placeholder-zinc-400 flex-1 px-3 py-2 dark:bg-surface-800 border border-gray-300 rounded text-sm focus:outline-none"
                />
              </div>
    
              <div class="space-y-3 pt-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="PHONE CALL"
                    v-model="preferredContactMethod"
                    class="w-4 h-4  accent-black cursor-pointer"
                  />
                  <span class="font-bold text-xs uppercase tracking-wide">PHONE CALL</span>
                </label>
    
                <hr class="border-gray-200" />
    
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="TELEGRAM"
                    v-model="preferredContactMethod"
                    class="w-4 h-4 accent-black cursor-pointer"
                  />
                  <span class="font-bold text-xs uppercase tracking-wide">TELEGRAM</span>
                </label>
              </div>
            </div>
          </div>

          <!-- SUMMARY SECTION -->
          <div class="dark:bg-surface-800 shadow-md p-6 space-y-3 font-sans">
            <div class="flex justify-between items-center text-base">
              <span class="font-semibold">Total</span>
              <span class="font-semibold">${{ originalTotal.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="font-semibold">Save</span>
              <span class="font-semibold text-black/80 dark:text-white/80">-${{ totalSaving.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="font-semibold">Delivery fee</span>
              <span class="font-semibold text-black/80 dark:text-white/80">${{ deliveryFee.toFixed(2) }}</span>
            </div>

            <hr class="border-gray-200 my-2" />

            <div class="flex justify-between items-center text-md font-bold pt-1">
              <span>Amount to pay</span>
              <span class="text-red-600">${{ amountToPay.toFixed(2) }}</span>
            </div>
          </div>

          <button 
            @click="handleCheckout"
            :disabled="orderStore.loading"
            class="w-full py-3 font-semibold bg-black/90 dark:border border-white/30 text-white hover:bg-black/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ orderStore.loading ? 'Processing Order...' : 'Proceed to Checkout' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddressModal
      :is-open="isModalOpen"
      :is-delete-open="deleteOpen"
      :initial-data="modalInitialData"
      @close="handleCloseModal"
      @save="handleSaveAddress"
      @delete="handleDeleteAddress"
    />

    <AbaPaywayModal
      :is-open="isPaywayModalOpen"
      :payway-data="paywayData"
      @close="handleClosePaywayModal"
    />
  </div>
</template>

