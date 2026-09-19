<script setup lang="ts">
  import { ref, computed, watch, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore';
  import type { IPaywayData } from '@/types/iorder';

  const props = defineProps<{
    isOpen: boolean;
    paywayData: IPaywayData | null;
  }>();

  const emit = defineEmits(['close', 'success']);
  const orderStore = useOrderStore();
  const router = useRouter();

  const qrResponse = ref<{ qrImage?: string; abapay_deeplink?: string } | null>(null);

  const formattedAmount = computed(() => {
    const raw = props.paywayData?.amount;
    if (!raw) return '0.00';
    const num = Number(raw);
    return Number.isNaN(num)
      ? raw
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  const paymentState = ref<'idle' | 'polling' | 'failed'>('idle');
  const errorMessage = ref<string | null>(null);

  // Timer state (3 minutes = 180 seconds to match ABA UI)
  const INITIAL_COUNTDOWN_SECONDS = 180;
  const timeRemaining = ref(INITIAL_COUNTDOWN_SECONDS);
  let timerIntervalId: ReturnType<typeof setInterval> | null = null;

  let pollIntervalId: ReturnType<typeof setInterval> | null = null;
  let redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const POLL_INTERVAL_MS = 3000;
  const REDIRECT_DELAY_MS = 2000;

  // Format seconds to mm:ss
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60);
    const seconds = timeRemaining.value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  const stopPolling = () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
    if (redirectTimeoutId) {
      clearTimeout(redirectTimeoutId);
      redirectTimeoutId = null;
    }
  };

  const startCountdown = () => {
    timeRemaining.value = INITIAL_COUNTDOWN_SECONDS;
    if (timerIntervalId) clearInterval(timerIntervalId);

    timerIntervalId = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value -= 1;
      } else {
        // Time expired -> trigger timeout state
        stopPolling();
        paymentState.value = 'failed';
        errorMessage.value = 'Payment timer expired. Please try again.';
      }
    }, 1000);
  };

  const startPolling = (tranId: string) => {
    stopPolling();
    paymentState.value = 'polling';
    startCountdown();

    pollIntervalId = setInterval(async () => {
      try {
        const res = await orderStore.checkStatus(tranId);
        const status = res?.status;

        if (status === 'APPROVED') {
          stopPolling();
          redirectTimeoutId = setTimeout(() => {
            redirectTimeoutId = null;
            emit('success', res?.order ?? { tran_id: tranId });
            emit('close');
            router.push({ path: '/order-success', query: { tran_id: tranId } });
          }, REDIRECT_DELAY_MS);
        } else if (status === 'FAILED') {
          stopPolling();
          paymentState.value = 'failed';
          errorMessage.value = 'Payment failed or was declined. Please try again.';
        }
      } catch {
        // Ignore hiccup on individual tick
      }
    }, POLL_INTERVAL_MS);
  };

  const generateQrCode = async () => {
    if (!props.paywayData) return;
    errorMessage.value = null;

    try {
      const response = await orderStore.createPaywayPurchase(props.paywayData);
      const data = response?.data;

      if (data?.status?.code === '00') {
        qrResponse.value = {
          qrImage: data.qrImage,
          abapay_deeplink: data.abapay_deeplink,
        };
        startPolling(props.paywayData.tran_id);
      } else {
        errorMessage.value = data?.status?.message || 'Failed to generate KHQR code.';
      }
    } catch {
      errorMessage.value = 'Failed to generate KHQR code. Please try again.';
    }
  };

  const resetState = () => {
    stopPolling();
    qrResponse.value = null;
    paymentState.value = 'idle';
    errorMessage.value = null;
    timeRemaining.value = INITIAL_COUNTDOWN_SECONDS;
  };

  watch(() => props.isOpen, (open) => {
    if (!open) {
      resetState();
    }
  });

  onUnmounted(() => {
    stopPolling();
  });
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="bg-white dark:bg-surface-800 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl relative transition-all">
      
      <!-- Top Bar / Header -->
      <div class="p-6 flex items-center justify-between  border-gray-100 dark:border-surface-700">
        <!-- Logo Header -->
        <div class="flex items-center gap-2">
          <img class="w-14 h-8 rounded-sm" src="../../assets/image/aba.jpg" alt="ABA" />
          <span class="font-bold text-gray-800 dark:text-white text-lg tracking-wide">ABA PAY</span>
        </div>

        <!-- Timer + Close Button -->
        <div class="flex items-center gap-3">
          <!-- Countdown Indicator -->
          <div v-if="paymentState === 'polling'" class="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
            <svg class="w-4 h-4 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>{{ formattedTime }}</span>
          </div>

          <!-- Close Icon -->
          <button @click="emit('close')" class="text-[#055e7c] hover:text-gray-600 dark:hover:text-white transition cursor-pointer">
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class=" mb-10 text-center space-y-4">
        <!-- Amount Header -->
        <div class="space-y-0.5">
          <div v-if="paymentState !== 'failed'" class="text-3xl font-extrabold tracking-tight flex justify-center items-center gap-2">
            {{ formattedAmount }} <span class="text-lg font-medium">USD</span>
          </div>
        </div>

        <!-- Failed / Expired State -->
        <div v-if="paymentState === 'failed'" class="px-6 space-y-3">
          <div class="w-14 h-14 mx-auto rounded-full bg-[#055e7c] shadow-lg flex items-center justify-center">
            <i class="ri-time-line text-2xl text-white"></i>
          </div>
          <h3 class="text-base font-bold">Transaction Timed Out</h3>
          <p class="text-xs text-black/60 dark:text-white/60 max-w-xs mx-auto">{{ errorMessage }}</p>
          <button
            @click="resetState"
            class="w-full mt-2 py-2.5 bg-[#055e7c] text-white font-bold rounded-sm hover:bg-[#055e7c] cursor-pointer transition text-sm"
          >
            Try Again
          </button>
        </div>

        <!-- QR Display State -->
        <div v-else-if="qrResponse?.qrImage" class="flex flex-col items-center space-y-4">
          <!-- Frame around QR -->
          <div class="relative p-6 rounded-xl border border-gray-200 dark:border-[#055e7c] shadow-inner">
            <!-- Corner Accents -->
            <div class="absolute top-2 left-2 w-5 h-5 border-t-3 border-l-3 border-amber-500 dark:border-[#055e7c] rounded-tl"></div>
            <div class="absolute top-2 right-2 w-5 h-5 border-t-3 border-r-3 border-amber-500 dark:border-[#055e7c] rounded-tr"></div>
            <div class="absolute bottom-2 left-2 w-5 h-5 border-b-3 border-l-3 border-amber-500 dark:border-[#055e7c] rounded-bl"></div>
            <div class="absolute bottom-2 right-2 w-5 h-5 border-b-3 border-r-3 border-amber-500 dark:border-[#055e7c] rounded-br"></div>

            <p class="text-xs font-semibold mb-2">Scan to pay</p>
            <img :src="qrResponse.qrImage" alt="KHQR Code" class="w-56 h-56 object-contain" />
          </div>

          <!-- Deep Link for Mobile -->
          <!-- <a
            v-if="qrResponse?.abapay_deeplink"
            :href="qrResponse.abapay_deeplink"
            class="w-full py-2.5 bg-[#005c8a] text-white font-bold rounded-sm hover:bg-[#004b71] transition text-sm text-center mt-2 block"
          >
            Open in ABA Mobile
          </a> -->
        </div>

        <!-- Initial Idle State -->
        <div v-else class="space-y-4 px-6">
          <p class="text-xs text-black/60 dark:text-white/60">
            Generate your official ABA KHQR code to scan or open directly in your mobile app.
          </p>
          <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
          <button
            @click="generateQrCode"
            :disabled="orderStore.loading"
            class="w-full mt-2 py-2.5 bg-[#055e7c] text-white font-bold cursor-pointer rounded-sm hover:bg-[#055e7d] transition text-sm disabled:opacity-50"
          >
            {{ orderStore.loading ? 'Generating KHQR...' : 'Open KHQR Code' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
